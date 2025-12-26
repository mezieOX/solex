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
            size={20}
            color={AppColors.textSecondary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  text: {
    fontSize: 16,
    color: AppColors.text,
    flex: 1,
  },
  placeholder: {
    color: AppColors.textSecondary,
  },
});
