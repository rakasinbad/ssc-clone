import React from "react";

export interface ConnectorProps {
  isActive: boolean;
  activeColor: string;
  inActiveColor: string;
  height: number;
}

export type ConnectorComponent = React.FC<ConnectorProps>;
