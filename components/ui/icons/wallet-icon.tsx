import React from "react";
import Svg, { Path } from "react-native-svg";

interface WalletIconProps {
  size?: number;
  color?: string;
}

export function WalletIcon({ size = 17, color = "white" }: WalletIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 17 14" fill="none">
      <Path
        d="M14.175 7.14166C14.175 8.21666 15.0583 9.09166 16.1333 9.09166C16.1333 12.2167 15.35 13 12.225 13H4.40833C1.28333 13 0.5 12.2167 0.5 9.09166V8.70832C1.575 8.70832 2.45833 7.82499 2.45833 6.74999C2.45833 5.67499 1.575 4.79166 0.5 4.79166V4.40832C0.508333 1.28333 1.28333 0.5 4.40833 0.5H12.2167C15.3417 0.5 16.125 1.28333 16.125 4.40832V5.19166C15.05 5.19166 14.175 6.05832 14.175 7.14166Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

