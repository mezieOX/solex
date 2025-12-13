/**
 * Custom Toast Configuration
 * Matches app's dark theme with gold accents
 */

import { AppColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const toastConfig = {
  /**
   * Success Toast
   */
  success: ({ text1, text2 }: any) => (
    <View style={styles.successContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color={AppColors.success} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),

  /**
   * Error Toast
   */
  error: ({ text1, text2 }: any) => (
    <View style={styles.errorContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="close-circle" size={24} color={AppColors.error} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),

  /**
   * Info Toast
   */
  info: ({ text1, text2 }: any) => (
    <View style={styles.infoContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="information-circle" size={24} color={AppColors.blue} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),

  /**
   * Warning Toast
   */
  warning: ({ text1, text2 }: any) => (
    <View style={styles.warningContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="warning" size={24} color={AppColors.warning} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.success,
    padding: 16,
    minHeight: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.error,
    padding: 16,
    minHeight: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.blue,
    padding: 16,
    minHeight: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.warning,
    padding: 16,
    minHeight: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
});
