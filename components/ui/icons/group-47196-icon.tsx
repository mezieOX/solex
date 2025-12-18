import React from "react";
import Svg, { Path } from "react-native-svg";

interface Group47196IconProps {
  size?: number;
  color?: string;
}

export function Group47196Icon({ size = 26, color = "#34C759" }: Group47196IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        d="M5 13.4444L1 9.88889L13 1L25 9.88889L21 13.4444"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.6667 15.2225C14.6667 15.7748 15.1145 16.2225 15.6667 16.2225C16.219 16.2225 16.6667 15.7748 16.6667 15.2225H14.6667ZM14.6667 2.77808V15.2225H16.6667V2.77808H14.6667Z"
        fill={color}
      />
      <Path
        d="M5 13.4444V20.5556L13 25L21 20.5556V13.4444C21 13.4444 19.6667 9.88889 13 9.88889C6.33333 9.88889 5 13.4444 5 13.4444Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

