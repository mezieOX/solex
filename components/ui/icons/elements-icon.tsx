import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface ElementsIconProps {
  size?: number;
  color?: string;
}

export function ElementsIcon({ size = 22, color = "#FF4DC2" }: ElementsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M8.75 15.75L14.75 9.75L14.25 12.75M12.75 5.75L6.75 11.75L7.25 8.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="10.75" cy="10.75" r="10" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

