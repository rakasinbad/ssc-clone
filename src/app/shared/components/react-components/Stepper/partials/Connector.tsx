import React, { useMemo } from "react";
import { ConnectorComponent } from "./Connector.type";

export const Connector: ConnectorComponent = ({
  isActive,
  activeColor,
  inActiveColor,
  height,
}) => {
  return (
    <div
      style={{ 
        height: height, 
        "display":"flex",
        "width":"100%",
        "justifyContent":"start",
        "alignItems":"center",
        position: "relative"
      }}
    >
      <div
        style={{
          "position":"absolute",
          "zIndex":"0",
          "border": "1px solid #dae0e7",
          width: "100%"
        }}
      ></div>
      <div
        style={{
          "zIndex":"50",
          "transitionDuration":"700ms",
          "transitionTimingFunction":"cubic-bezier(0.4, 0, 0.2, 1)",
          "borderTop":"1px solid #ec1a24",
          "width": isActive ? "100%" : 0,
        }}
      ></div>
    </div>
  );
};
