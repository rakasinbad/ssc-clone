import { createContext, useContext } from "react";

import { StepperValues } from "./Stepper.types";

export const StepperContext = createContext<StepperValues | null>(null);

export const useStepper = () => {
  const context = useContext(StepperContext);

  if (!context) {
    throw Error("Wrap your step with <Stepper>");
  } else {
    return context as StepperValues;
  }
};
