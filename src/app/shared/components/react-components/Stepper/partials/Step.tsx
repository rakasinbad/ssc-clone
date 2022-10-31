import React, { useMemo } from "react";
import { useStepper } from "../Stepper.utils";
import { Connector } from "./Connector";
import { StepComponent } from "./Step.type";
import { Icon } from "../../Icon";

export const Step: StepComponent = ({
  index,
  stepSize = 36,
  title,
  desc,
  variant,
  icon = "check",
}) => {
  const { isLastStep, activeStep, stepperConfig } = useStepper();

  const isActive = useMemo(() => index <= activeStep, [index, activeStep]);
  const isLastActive = useMemo(() => index <= activeStep - 1, [index, activeStep]);
  const isPassed = useMemo(() => index !== activeStep, [index, activeStep]);
  
  const nodeStyle = isActive 
    ? isPassed ? {
      "backgroundColor":"white",
      "fill":"#ec1a24",
      "border":"1px solid #ec1a24"
    } : {
      "backgroundColor":"#ec1a24",
      "stroke":"#ec1a24",
      "border":"1px solid #ec1a24"
    }
    : {
      "backgroundColor":"white",
      "border":"1px solid #dae0e7",
      "stroke":"#dae0e7"
    }
  ;

  return (
    <>
      <div>
        <li
          // className={classNames("snb-stepper__step-node", nodeStyle)}
          style={{
            width: stepSize,
            height: stepSize,
            "borderRadius":"9999px",
            "display":"flex",
            "alignItems":"center",
            "position":"relative",
            "transitionProperty":"background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
            "transitionDuration":"300ms",
            "justifyContent":"center",
            padding: "4px",
            ...nodeStyle
          }}
          title={`Step ${index + 1}`}
        >
          <>
            {(isActive && !isPassed && variant === "number" && icon === "x") && <Icon name={icon} size="medium" color="white" />}
            {(isActive && !isPassed && variant === "number" && icon !== "x") && <p style={{ color: 'white' }}>{index + 1}</p>}
            {(isActive && isPassed && variant === "number") && <p style={{ color: 'red' }}>{index + 1}</p>}
            {(!isActive && variant === "number") && index + 1}
            {(isActive && !isPassed && variant === "plain") && <Icon name={icon} size="medium" color="white" />}
            {(isActive && isPassed && variant === "plain") && <Icon name={icon} size="medium" color="red" />}
          </>
        </li>
        <div style={{"position":"relative"}}>
          <span style={{
            "display":"flex",
            "left":"50%",
            position: 'absolute',
            "transform": "translateX(-50%)",
            "textAlign":"center",
            "flexDirection":"column",
            "alignItems":"center",
            "width":"10rem",
            padding: '0px',
            maxLines: 2, textOverflow: "ellipsis",
            WebkitLineClamp: 2,
            lineClamp: 2,
            'wordWrap': 'break-word',
            overflow: 'hidden'
          }} className="text-container">
            <span style={{ color: '#52575c', fontWeight: 'bold', fontSize: '14px' }}>{title}</span>
            <span className="text-description">{desc}</span>
          </span>
        </div>
      </div>

      {index !== stepperConfig.length - 1 && (
        <Connector
          height={stepSize || 0}
          isActive={isLastActive || false}
          activeColor={"#ec1a24"}
          inActiveColor={"#acb8c3"}
        />
      )}
    </>
  );
};
