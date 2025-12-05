import React from "react";
import Svg, { Path } from "react-native-svg";

interface CryptoIconProps {
  size?: number;
  color?: string;
}

export function CryptoIcon({ size = 22, color = "white" }: CryptoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M4.75 4.75L6.75 2.75M6.75 2.75L4.75 0.75M6.75 2.75H4.75C2.54086 2.75 0.75 4.54086 0.75 6.75M16.75 16.75L14.75 18.75M14.75 18.75L16.75 20.75M14.75 18.75H16.75C18.9591 18.75 20.75 16.9591 20.75 14.75M12.1672 12.1672C12.9494 12.5408 13.8253 12.75 14.75 12.75C18.0637 12.75 20.75 10.0637 20.75 6.75C20.75 3.43629 18.0637 0.75 14.75 0.75C11.4363 0.75 8.75 3.43629 8.75 6.75C8.75 7.67472 8.95919 8.55057 9.33283 9.33283M12.75 14.75C12.75 18.0637 10.0637 20.75 6.75 20.75C3.43629 20.75 0.75 18.0637 0.75 14.75C0.75 11.4363 3.43629 8.75 6.75 8.75C10.0637 8.75 12.75 11.4363 12.75 14.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
