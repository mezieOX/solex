import { AppColors } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

export default function LoadingScreen({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.container, style]}>
      <StatusBar style="light" />
      <LottieView
        source={require("@/assets/lottie/Loading Lottie animation.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "90%",
    backgroundColor: AppColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 100,
    height: 100,
  },
});
