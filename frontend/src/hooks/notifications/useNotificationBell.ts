import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NOTIFICATION_KINDS } from '../../constants/notifications';
import type { AppNotification, NotificationFilter } from '../../types/notification';
import { useMarkAllNotificationsRead } from './useMarkAllNotificationsRead';
import { useMarkNotificationRead } from './useMarkNotificationRead';
import { useNotifications } from './useNotifications';

/** Campana del navbar: contador, panel desplegable con filtro y acciones de lectura. */
export function useNotificationBell() {
    const feed = useNotifications();
    const markRead = useMarkNotificationRead();
    const markAll = useMarkAllNotificationsRead();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const containerRef = useRef<HTMLDivElement>(null);

    // Se cierra al hacer clic fuera o con Escape, como cualquier menú.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const items = feed.data?.items ?? [];
    const unreadCount = feed.data?.unread_count ?? 0;

    return {
        containerRef,
        open,
        toggle: () => setOpen((current) => !current),
        filter,
        setFilter,
        items: filter === 'unread' ? items.filter((item) => !item.read_at) : items,
        unreadCount,
        loading: feed.isPending,
        failed: feed.isError,
        retry: () => void feed.refetch(),
        openNotification: (notification: AppNotification) => {
            if (!notification.read_at) markRead.mutate(notification.id);
            setOpen(false);
            navigate(NOTIFICATION_KINDS[notification.kind].target);
        },
        markAllRead: () => markAll.mutate(),
        canMarkAll: unreadCount > 0 && !markAll.isPending,
    };
}
