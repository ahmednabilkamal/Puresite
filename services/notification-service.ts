import { API_CONFIG } from "@/constants/api";
import apiClient from "@/utils/api";

export interface NotificationItem {
  id: number;
  title: string;
  message?: string;
  body?: string;
  created_at: string;
  read_at: string | null;
}

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },
};
