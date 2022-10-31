import React, { CSSProperties } from "react";
import { forwardRef, memo, useMemo } from "react";
import IcoMoon from "react-icomoon";
import iconSet from "./assets/selection.json";
import { IconProps } from "./Icon.types";

const IconMemo = forwardRef<SVGElement, IconProps>(
  ({ name, size = "medium", className, ...props }, ref) => {
    const iconStyle = {
      tiny: { width: '12px', heigh: '12px' },
      small: { width: '16px', heigh: '16px' },
      medium: { width: '24px', heigh: '24px' },
      large: { width: '32px', heigh: '32px' },
    };

    return (
      <IcoMoon
        {...props}
        ref={ref}
        iconSet={iconSet}
        icon={name}
        disableFill
        style={iconStyle[size]}
      />
    );
  }
);

export const Icon = memo(IconMemo);
