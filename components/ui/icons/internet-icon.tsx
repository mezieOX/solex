import React from "react";
import Svg, { Path } from "react-native-svg";

interface InternetIconProps {
  size?: number;
  color?: string;
}

export function InternetIcon({ size = 24, color = "#FB4B3C" }: InternetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.0002 22C17.5231 22 22.0002 17.5228 22.0002 12C22.0002 6.47715 17.5231 2 12.0002 2C6.4774 2 2.00024 6.47715 2.00024 12C2.00024 17.5228 6.4774 22 12.0002 22Z"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M12.0002 22C14.2094 22 16.0002 17.5228 16.0002 12C16.0002 6.47715 14.2094 2 12.0002 2C9.79111 2 8.00024 6.47715 8.00024 12C8.00024 17.5228 9.79111 22 12.0002 22Z"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M2.00024 12H22.0002"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

