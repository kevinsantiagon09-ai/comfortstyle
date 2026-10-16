import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../api/queryKeys';
import { getEcho, realtimeEnabled } from '../../lib/echo';
import { useNotificationToastStore } from '../../store/notificationToastStore';
import type { BroadcastNotificationPayload, NotificationFeed } from '../../types/notification';
import { prependNotification } from '../../utils/notifications';
import { useAuth } from '../auth/session/useAuth';

/**
 * Escucha el canal privado del usuario en Reverb. Cada notificación nueva entra a la campana,
 * se muestra como aviso emergente y refresca los listados de reservas.
 */
export function useNotificationStream() {
    const { user } = useAuth();
    const userId = user?.id;
    const client = useQueryClient();
    const pushToast = useNotificationToastStore((state) => state.push);

    useEffect(() => {
        if (userId === undefined || !realtimeEnabled) return;
        const channelName = `App.Models.User.${userId}`;

        getEcho().private(channelName).notification((payload: BroadcastNotificationPayload) => {
            const notification = { ...payload, read_at: null, created_at: new Date().toISOString() };
            client.setQueryData<NotificationFeed>(queryKeys.notifications, (feed) => prependNotification(feed, notification));
            pushToast(notification);
            void client.invalidateQueries({ queryKey: queryKeys.guestReservations });
        });

        return () => getEcho().leave(channelName);
    }, [userId, client, pushToast]);
}
