import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../../api/notifications.api';
import { queryKeys } from '../../api/queryKeys';
import { useAuth } from '../auth/session/useAuth';

/** Notificaciones del usuario. Las nuevas llegan por Reverb y se agregan a esta misma caché. */
export function useNotifications() {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: queryKeys.notifications,
        queryFn: ({ signal }) => getNotifications(signal),
        enabled: isAuthenticated,
        staleTime: 60_000,
    });
}
