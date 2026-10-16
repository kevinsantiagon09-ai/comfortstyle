import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationRead } from '../../api/notifications.api';
import { queryKeys } from '../../api/queryKeys';
import type { NotificationFeed } from '../../types/notification';
import { markFeedRead } from '../../utils/notifications';

/** Se marca leída al instante en pantalla; si el servidor falla, se vuelve a consultar. */
export function useMarkNotificationRead() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: markNotificationRead,
        onMutate: (id) => client.setQueryData<NotificationFeed>(queryKeys.notifications, (feed) => markFeedRead(feed, id)),
        onError: () => client.invalidateQueries({ queryKey: queryKeys.notifications }),
    });
}
