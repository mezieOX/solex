import { AppColors } from "@/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
export default function ComingSoon({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("@/assets/images/marked.png")}
        style={styles.image}
        contentFit="contain"
      />
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.description}>
        We are working on this feature. Please check back later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  image: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.text,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: AppColors.textSecondary,
    lineHeight: 24,
  },
});
