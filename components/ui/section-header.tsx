import { AppColors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  actionText,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.actionLink}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
  },
  actionLink: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: "600",
  },
});

