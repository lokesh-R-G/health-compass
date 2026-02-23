import apiClient from "@/lib/api";
import type { Notification } from "@/types";

export const notificationService = {
  /**
   * Get all notifications
   */
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>("/notifications");
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: number): Promise<Notification> => {
    const response = await apiClient.post<Notification>("/notifications/mark-read", {
      notification_id: notificationId,
    });
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post("/notifications/mark-all-read");
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
    return response.data.count;
  },
};
