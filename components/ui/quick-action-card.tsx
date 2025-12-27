import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface QuickActionCardProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconSize?: number;
  iconBackgroundColor?: string;
  iconContainerStyle?: ViewStyle;
  customIcon?: React.ReactNode;
  onPress?: () => void;
}

export function QuickActionCard({
  title,
  icon,
  iconColor = "#fff",
  iconSize = 24,
  iconBackgroundColor,
  iconContainerStyle,
  customIcon,
  onPress,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, iconContainerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}
      >
        {customIcon ? (
          customIcon
        ) : icon ? (
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        ) : null}
      </View>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.orange,
  },
  text: {
    fontSize: 12,
    color: AppColors.text,
    textAlign: "center",
    paddingTop: 6,
    lineHeight: 16,
  },
});
