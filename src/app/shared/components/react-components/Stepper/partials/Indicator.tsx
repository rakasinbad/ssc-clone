import * as React from "react";
import { Step } from "./Step";
import { IndicatorComponent } from "./Indicator.type";

export const Indicator: IndicatorComponent = ({ stepConfig, variant }) => {
  return (
    <>
      <ul style={{
        "display":"flex", 
        "flexDirection":"row",
        justifyContent: 'space-between',
        "height":"8rem",
        padding: '0px 32px',
      }}>
        {stepConfig.map((step, idx) => (
          <Step
            key={step.id ? step.id : idx}
            index={idx}
            title={step.title}
            desc={step.description}
            variant={variant}
            icon={step.icon}
          />
        ))}
      </ul>
    </>
  );
};
