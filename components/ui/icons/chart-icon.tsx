import React from "react";
import Svg, { Path } from "react-native-svg";

interface ChartIconProps {
  size?: number;
  color?: string;
}

export function ChartIcon({ size = 20, color = "#F8C11E" }: ChartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5.75 4.75V14.75M9.75 8.75V14.75M13.75 12.75V14.75M5.55 18.75H13.95C15.6302 18.75 16.4702 18.75 17.112 18.423C17.6765 18.1354 18.1354 17.6765 18.423 17.112C18.75 16.4702 18.75 15.6302 18.75 13.95V5.55C18.75 3.86984 18.75 3.02976 18.423 2.38803C18.1354 1.82354 17.6765 1.3646 17.112 1.07698C16.4702 0.75 15.6302 0.75 13.95 0.75H5.55C3.86984 0.75 3.02976 0.75 2.38803 1.07698C1.82354 1.3646 1.3646 1.82354 1.07698 2.38803C0.75 3.02976 0.75 3.86984 0.75 5.55V13.95C0.75 15.6302 0.75 16.4702 1.07698 17.112C1.3646 17.6765 1.82354 18.1354 2.38803 18.423C3.02976 18.75 3.86984 18.75 5.55 18.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
