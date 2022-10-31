import React from "react";

export interface IStepConfig {
  id: number | string;
  title: string;
  description: string;
  icon?: "check" | "x";
}

export interface IndicatorProps {
  stepConfig: StepConfig[];
  variant?: "number" | "plain";
}

export type IndicatorComponent = React.FC<IndicatorProps>;

export class StepConfig implements IStepConfig {
  id: number | string;
  title: string;
  description: string;
  icon?: "check" | "x";

  constructor(data?: IStepConfig) {
    const {
      id, 
      title,
      description,
      icon
    } = data;

    this.id = id;
    this.title = title;
    this.description = description;
    this.icon = icon;
  }
}
