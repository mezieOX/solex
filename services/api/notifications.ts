/**
 * Notifications API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string | null;
  message: string;
  data: any | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  total_pages: number;
  notifications: Notification[];
}

export const notificationsApi = {
  /**
   * Get user notifications
   */
  getNotifications: async (): Promise<NotificationsResponse> => {
    const response = await apiClient.get<ApiResponse<NotificationsResponse>>(
      "/account/notifications"
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await apiClient.post<
      ApiResponse<{ notification: Notification }>
    >("/account/notification/read", {
      notification_id: notificationId,
    });
    return response.data.notification;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/account/notifications/read-all"
    );
    return response;
  },
};
