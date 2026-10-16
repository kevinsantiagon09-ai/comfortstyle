import http, { ensureCsrfCookie } from './http';
import type { ApiResponse } from '../types/api';
import type { NotificationFeed } from '../types/notification';

export async function getNotifications(signal?: AbortSignal) {
    return (await http.get<ApiResponse<NotificationFeed>>('/notifications', { signal })).data.data;
}

export async function markNotificationRead(id: string) {
    await ensureCsrfCookie();
    await http.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
    await ensureCsrfCookie();
    await http.patch('/notifications/read-all');
}
