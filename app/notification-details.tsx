import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import { Notification } from "@/services/api/notifications";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Format date to "DD MMM, YYYY" format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

// Format time to "HH:MM AM/PM" format
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export default function NotificationDetailsScreen() {
  const params = useLocalSearchParams();

  // Parse notification data from params
  const notification = useMemo(() => {
    try {
      const dataParam = params.notification;
      const data = Array.isArray(dataParam)
        ? dataParam[0]
        : (dataParam as string);
      if (!data) return null;
      const parsed = JSON.parse(data) as Notification;
      return parsed;
    } catch (error) {
      return null;
    }
  }, [params.notification]);

  if (!notification) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenTitle title="Notification Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Notification not found</Text>
        </View>
      </View>
    );
  }

  const formattedDate = formatDate(notification.created_at);
  const formattedTime = formatTime(notification.created_at);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenTitle title="Notification Details" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notification Header */}
        <View style={styles.headerSection}>
          {notification.title && (
            <Text style={styles.title}>{notification.title}</Text>
          )}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        </View>

        {/* Notification Message */}
        <View style={styles.messageSection}>
          <Text style={styles.messageLabel}>Message</Text>
          <Text style={styles.messageText}>{notification.message}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  headerSection: {
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 10,
    lineHeight: 24,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  messageSection: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: AppColors.text,
    lineHeight: 20,
  },
  detailsSection: {
    backgroundColor: AppColors.surfaceLight,
    borderRadius: 10,
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: AppColors.text,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 10,
    opacity: 0.3,
  },
});
