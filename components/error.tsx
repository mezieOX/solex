import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export default function Error({ message, onRetry, style }: ErrorProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="alert-circle-outline"
        size={48}
        color={AppColors.error}
      />
      <Text style={styles.errorText}>
        {message || "Something went wrong"}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: AppColors.text,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: AppColors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.background,
  },
});

