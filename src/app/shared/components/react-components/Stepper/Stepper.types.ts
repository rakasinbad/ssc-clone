import React from "react";
import { StepConfig } from "./partials";

export type Handler = (() => Promise<void>) | (() => void) | null;

export interface StepperProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
  initialActiveIndex?: number;
  stepperConfig: StepConfig[];
  indicator?: "number" | "plain";
}

export interface StepperValues {
  nextStep: () => Promise<void>;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  handleStep: (handler: Handler) => void;
  isLoading: boolean;
  activeStep: number;
  stepCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepperConfig: StepConfig[];
}

export type StepperComponent = React.FC<StepperProps>;
