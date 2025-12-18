import React from "react";
import Svg, { Path } from "react-native-svg";

interface ActivityIconProps {
  size?: number;
  color?: string;
}

export function ActivityIcon({ size = 24, color = "black" }: ActivityIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 12H18L15 21L9 3L6 12H2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

