/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

// App color scheme - Gold/Yellow accents on dark background
export const AppColors = {
  primary: "#FFB800", // Gold/Yellow
  primaryDark: "#FF9500",
  secondary: "#FF6B00",
  background: "#000000",
  backgroundDark: "#0A0A0A",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textMuted: "#808080",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  border: "#333333",
  red: "#FF3B30",
  orange: "#FF9500",
  blue: "#007AFF",
  green: "#34C759",
  // Additional colors
  redAccent: "#F94B32",
  orangeAccent: "#FF6900",
  blueAccent: "#155DFC",
  greenAccent: "#00C950",
  blueDark: "#00419C",
};

const tintColorLight = "#0a7ea4";
const tintColorDark = AppColors.primary;

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: AppColors.text,
    background: AppColors.background,
    tint: tintColorDark,
    icon: AppColors.textSecondary,
    tabIconDefault: AppColors.textMuted,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
