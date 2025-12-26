import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface DataIconProps {
  size?: number;
  color?: string;
}

export function DataIcon({ size = 24, color = "black" }: DataIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 19" fill="none">
      <Path
        d="M11.0041 5.99982L9.06562 13.9904C9.04353 14.0814 9.14756 14.1501 9.22263 14.0941L12.1418 11.914"
        stroke={color}
        strokeLinecap="round"
      />
      <Path
        d="M6.42953 13.8498L8.36798 5.85923C8.39007 5.76817 8.28603 5.69947 8.21096 5.75553L5.29176 7.93558"
        stroke={color}
        strokeLinecap="round"
      />
      <Rect x="0.5" y="1.5" width="17" height="17" rx="7.5" stroke={color} />
    </Svg>
  );
}
