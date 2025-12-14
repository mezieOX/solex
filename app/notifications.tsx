import Empty from "@/components/empty";
import Error from "@/components/error";
import { SkeletonText, SkeletonTitle } from "@/components/skeleton";
import { ScreenTitle } from "@/components/ui/screen-title";
import { AppColors } from "@/constants/theme";
import {
  useMarkNotificationAsRead,
  useNotifications,
} from "@/hooks/api/use-notifications";
import { Notification } from "@/services/api/notifications";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

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
  return `${displayHours}:${displayMinutes}${ampm}`;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to notification details
    router.push({
      pathname: "/notification-details",
      params: {
        notification: JSON.stringify(notification),
      },
    });
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    if (!data?.notifications) return [];

    const groups: NotificationGroup[] = [];
    const dateMap = new Map<string, Notification[]>();

    // Sort notifications by created_at (newest first)
    const sortedNotifications = [...data.notifications].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Group by date
    sortedNotifications.forEach((notification) => {
      const dateKey = formatDate(notification.created_at);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(notification);
    });

    // Convert map to array
    dateMap.forEach((notifications, date) => {
      groups.push({ date, notifications });
    });

    // Sort groups by date (newest first)
    return groups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <ScreenTitle title="Notification" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
      >
        {isLoading ? (
          <View>
            {/* Skeleton for date group */}
            <View style={styles.groupContainer}>
              <SkeletonTitle
                width="30%"
                height={18}
                style={styles.skeletonDate}
              />
              {[1, 2, 3].map((index) => (
                <View key={index}>
                  {index > 1 && <View style={styles.separator} />}
                  <View style={styles.notificationItem}>
                    <View style={styles.notificationContent}>
                      <View style={styles.messageContainer}>
                        <SkeletonTitle
                          width="60%"
                          height={16}
                          style={styles.skeletonTitle}
                        />
                        <SkeletonText
                          width="100%"
                          rows={2}
                          style={styles.skeletonMessage}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            {/* Second skeleton group */}
            <View style={styles.groupContainer}>
              <SkeletonTitle
                width="30%"
                height={18}
                style={styles.skeletonDate}
              />
              {[1, 2].map((index) => (
                <View key={index}>
                  {index > 1 && <View style={styles.separator} />}
                  <View style={styles.notificationItem}>
                    <View style={styles.notificationContent}>
                      <View style={styles.messageContainer}>
                        <SkeletonTitle
                          width="60%"
                          height={16}
                          style={styles.skeletonTitle}
                        />
                        <SkeletonText
                          width="100%"
                          rows={2}
                          style={styles.skeletonMessage}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : error ? (
          <Error
            message="Failed to load notifications"
            onRetry={() => refetch()}
          />
        ) : groupedNotifications.length === 0 ? (
          <Empty
            style={styles.emptyStyle}
            title="No notifications yet"
            description="You haven't received any notifications yet"
          />
        ) : (
          groupedNotifications.map((group) => (
            <View key={group.date} style={styles.groupContainer}>
              <Text style={styles.dateText}>{group.date}</Text>
              {group.notifications.map((notification, index) => (
                <View key={notification.id}>
                  {index > 0 && <View style={styles.separator} />}
                  <TouchableOpacity
                    style={[
                      styles.notificationItem,
                      !notification.read_at && styles.unreadNotification,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.messageContainer}>
                        {notification.title && (
                          <Text style={styles.notificationTitle}>
                            {notification.title}
                          </Text>
                        )}
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                      </View>
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.created_at)}
                      </Text>
                      {!notification.read_at && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  groupContainer: {
    marginBottom: 32,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 16,
  },
  notificationItem: {
    paddingVertical: 12,
  },
  notificationContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notificationMessage: {
    flex: 1,
    fontSize: 14,
    color: AppColors.text,
    marginRight: 12,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 8,
    opacity: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  unreadNotification: {
    opacity: 1,
  },
  messageContainer: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyStyle: {
    height: height - 200,
  },
  skeletonDate: {
    marginBottom: 16,
  },
  skeletonTitle: {
    marginBottom: 8,
  },
  skeletonMessage: {
    marginBottom: 0,
  },
});
