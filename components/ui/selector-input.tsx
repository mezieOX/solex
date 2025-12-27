import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SelectorInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  borderColor?: string;
  showIcon?: boolean;
}

export function SelectorInput({
  label,
  value,
  placeholder = "Select",
  onPress,
  icon,
  borderColor = AppColors.primary,
  showIcon = true,
}: SelectorInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.selector, { borderColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[styles.text, !value && styles.placeholder]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </View>
        {showIcon && (
          <Ionicons
            name="chevron-down"
            size={16}
            color={AppColors.textSecondary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 6,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  text: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },
  placeholder: {
    color: AppColors.textSecondary,
  },
});
