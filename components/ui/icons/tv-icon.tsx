import React from "react";
import Svg, { Path } from "react-native-svg";

interface TvIconProps {
  size?: number;
  color?: string;
}

export function TvIcon({ size = 24, color = "#A731AC" }: TvIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.00024 14C2.00024 10.2288 2.00024 8.34315 3.17181 7.17157C4.34339 6 6.229 6 10.0002 6H14.0002C17.7714 6 19.6571 6 20.8286 7.17157C22.0002 8.34315 22.0002 10.2288 22.0002 14C22.0002 17.7712 22.0002 19.6569 20.8286 20.8284C19.6571 22 17.7714 22 14.0002 22H10.0002C6.229 22 4.34339 22 3.17181 20.8284C2.00024 19.6569 2.00024 17.7712 2.00024 14Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M9 3L12 6L16 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

