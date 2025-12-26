import React from "react";
import Svg, { Path } from "react-native-svg";

interface CableIconProps {
  size?: number;
  color?: string;
}

export function CableIcon({ size = 20, color = "white" }: CableIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M1.6665 11.6667V13.3333C1.6665 15.6903 1.6665 16.8688 2.39874 17.6011C3.13097 18.3333 4.30948 18.3333 6.6665 18.3333H13.3332C15.6902 18.3333 16.8687 18.3333 17.6009 17.6011C18.3332 16.8688 18.3332 15.6903 18.3332 13.3333V10C18.3332 7.64297 18.3332 6.46447 17.6009 5.73223C16.8687 5 15.6902 5 13.3332 5H6.6665C4.30948 5 3.13097 5 2.39874 5.73223C1.86432 6.26665 1.71995 7.03879 1.68094 8.33333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M7.5 1.6665L10 4.58317L12.5 1.6665"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M13.3335 5V8.33333M13.3335 18.3333V11.6667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M16.6667 13.3333C16.6667 12.8731 16.2936 12.5 15.8333 12.5C15.3731 12.5 15 12.8731 15 13.3333C15 13.7936 15.3731 14.1667 15.8333 14.1667C16.2936 14.1667 16.6667 13.7936 16.6667 13.3333Z"
        fill={color}
      />
      <Path
        d="M16.6667 9.99984C16.6667 9.53959 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.53959 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984Z"
        fill={color}
      />
    </Svg>
  );
}

