import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";

interface ScreenTitleProps {
  title: string;
  style?: TextStyle;
}

export function ScreenTitle({ title, style }: ScreenTitleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={AppColors.text} />
      </TouchableOpacity>
      <Text style={[styles.title, style]}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    color: AppColors.text,
    textAlign: "center",
  },
  spacer: {},
});
