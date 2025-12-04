import React from "react";
import { Platform, View, ViewStyle } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export function SafeAreaView({ children, style, edges }: SafeAreaViewProps) {
  if (Platform.OS === "ios") {
    return (
      <RNSafeAreaView style={style} edges={edges || ["top", "bottom"]}>
        {children}
      </RNSafeAreaView>
    );
  }

  // Android: Use regular View with padding for status bar
  return (
    <View
      style={[{ paddingTop: Platform.OS === "android" ? 0 : undefined }, style]}
    >
      {children}
    </View>
  );
}
