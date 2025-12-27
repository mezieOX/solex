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
        <Ionicons name="checkmark-circle" size={18} color={AppColors.success} />
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
        <Ionicons name="close-circle" size={18} color={AppColors.error} />
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
        <Ionicons name="information-circle" size={18} color={AppColors.blue} />
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
        <Ionicons name="warning" size={18} color={AppColors.warning} />
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
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.success,
    padding: 10,
    minHeight: 45,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 12,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.error,
    padding: 10,
    minHeight: 45,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.blue,
    padding: 10,
    minHeight: 45,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 12,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.warning,
    padding: 10,
    minHeight: 45,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: 11,
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
});
