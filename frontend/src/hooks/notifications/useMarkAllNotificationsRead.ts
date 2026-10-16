import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllNotificationsRead } from '../../api/notifications.api';
import { queryKeys } from '../../api/queryKeys';
import type { NotificationFeed } from '../../types/notification';
import { markFeedRead } from '../../utils/notifications';

export function useMarkAllNotificationsRead() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsRead,
        onMutate: () => client.setQueryData<NotificationFeed>(queryKeys.notifications, (feed) => markFeedRead(feed)),
        onError: () => client.invalidateQueries({ queryKey: queryKeys.notifications }),
    });
}
