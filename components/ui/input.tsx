import { AppColors } from "@/constants/theme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[styles.inputContainer, error && styles.inputContainerError]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={AppColors.textMuted}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "500",
    fontSize: 14,
    color: AppColors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: AppColors.error,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: AppColors.text,
    paddingVertical: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 12,
  },
  inputWithRightIcon: {
    paddingRight: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 4,
  },
});
