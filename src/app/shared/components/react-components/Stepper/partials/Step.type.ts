import React from "react";

export interface StepProps {
  index: number;
  title: string;
  desc: string;
  stepSize?: number;
  variant?: "number" | "plain";
  icon?: "check" | "x";
}

export type StepComponent = React.FC<StepProps>;
