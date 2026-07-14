import { api } from "../lib/api";
import type { Notification } from "../types";

export interface NotificationsPage {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  hasMore: boolean;
}

export async function listNotifications(page = 1, limit = 20) {
  const res = await api.get<NotificationsPage>("/notifications", { params: { page, limit } });
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await api.patch<{ notification: Notification }>(`/notifications/${id}/read`);
  return res.data.notification;
}
