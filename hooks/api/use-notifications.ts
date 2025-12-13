/**
 * Notifications hooks using TanStack Query
 */

import { notificationsApi, Notification } from "@/services/api/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: () => [...notificationKeys.lists()] as const,
};

/**
 * Hook to get user notifications
 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsApi.getNotifications(),
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

