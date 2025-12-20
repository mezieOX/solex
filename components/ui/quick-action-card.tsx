import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuickActionCardProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  customIcon?: React.ReactNode;
  onPress?: () => void;
}

export function QuickActionCard({
  title,
  icon,
  iconColor = "#fff",
  iconBackgroundColor = AppColors.orange,
  customIcon,
  onPress,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}
      >
        {customIcon ? (
          customIcon
        ) : icon ? (
          <Ionicons name={icon} size={32} color={iconColor} />
        ) : null}
      </View>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.orange,
  },
  text: {
    fontSize: 14,
    color: AppColors.text,
    textAlign: "center",
    paddingTop: 10,
    lineHeight: 18,
  },
});
