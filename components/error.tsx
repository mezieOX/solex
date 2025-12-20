import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
}

export default function Error({
  message,
  onRetry,
  isLoading = false,
  style,
}: ErrorProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle-outline" size={48} color={AppColors.error} />
      <Text style={styles.errorText}>{message || "Something went wrong"}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, isLoading && styles.retryButtonDisabled]}
          onPress={onRetry}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={AppColors.background} />
          ) : (
            <Text style={styles.retryButtonText}>Retry</Text>
          )}
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
  retryButtonDisabled: {
    opacity: 0.7,
  },
});
