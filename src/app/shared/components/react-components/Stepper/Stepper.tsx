import React, {
  Children,
  memo,
  useMemo,
  useRef,
  useState,
} from "react";
import { Indicator } from "./partials";

import { Handler, StepperComponent } from "./Stepper.types";
import { StepperContext } from "./Stepper.utils";

const StepperMemo: StepperComponent = ({
  footer,
  children,
  initialActiveIndex = 0,
  stepperConfig = [],
  indicator = "plain",
}) => {
  const [activeStep, setActiveStep] = useState<number>(initialActiveIndex);
  const [isLoading, setIsLoading] = useState(false);
  const hasNextStep = useRef(true);
  const hasPreviousStep = useRef(false);
  const nextStepHandler = useRef<Handler>(() => {});
  const stepCount = stepperConfig.length; // Children.toArray(children).length
  const failedIndex = stepperConfig.findIndex((step) => step.icon === "x" ? true : false);

  hasNextStep.current = activeStep < stepCount - 1;
  hasNextStep.current =
    failedIndex >= 0 ? activeStep < failedIndex : hasNextStep.current;
  hasPreviousStep.current = activeStep > 0;
  hasPreviousStep.current =
    failedIndex >= 0
      ? activeStep > 0 && activeStep <= failedIndex
      : hasPreviousStep.current;

  const goToNextStep = useRef(() => {
    if (hasNextStep.current) {
      setActiveStep((activeStep) => activeStep + 1);
    }
  });

  const goToPreviousStep = useRef(() => {
    if (hasPreviousStep.current) {
      nextStepHandler.current = null;
      setActiveStep((activeStep) => activeStep - 1);
    }
  });

  const goToStep = useRef((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < stepCount) {
      nextStepHandler.current = null;
      setActiveStep(stepIndex);
    } else {
      console.warn("[Stepper Component] Invalid stepIndex");
    }
  });

  // Callback handler that will be called once nextStep has been called
  const handleStep = useRef((handler: Handler) => {
    nextStepHandler.current = handler;
  });

  const doNextStep = useRef(async () => {
    if (hasNextStep.current && nextStepHandler.current) {
      try {
        setIsLoading(true);
        await nextStepHandler.current();
        setIsLoading(false);
        nextStepHandler.current = null;
        goToNextStep.current();
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    } else {
      goToNextStep.current();
    }
  });

  // Assign context values
  const stepperValue = useMemo(() => {
    let active = activeStep;

    return {
      nextStep: doNextStep.current,
      previousStep: goToPreviousStep.current,
      handleStep: handleStep.current,
      isLoading,
      activeStep: active,
      stepCount,
      isFirstStep: !hasPreviousStep.current,
      isLastStep: !hasNextStep.current,
      goToStep: goToStep.current,
      stepperConfig,
    };
  }, [activeStep, stepCount, isLoading]);

  const activeStepContent = useMemo(() => {
    const reactChildren = Children.toArray(children);

    return reactChildren[activeStep];
  }, [activeStep, children, footer]);

  return (
    <StepperContext.Provider value={stepperValue}>
      <Indicator stepConfig={stepperConfig} variant={indicator} />
      {activeStepContent}
      {footer}
    </StepperContext.Provider>
  );
};

export const Stepper = memo(StepperMemo);
