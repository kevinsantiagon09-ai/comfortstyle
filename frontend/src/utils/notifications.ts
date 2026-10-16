import type { AppNotification, NotificationFeed } from '../types/notification';

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3_600], ['minute', 60]];

/** "hace 5 minutos", "ayer"… como en las redes sociales. */
export function timeAgo(iso: string, now = Date.now()) {
    const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
    if (Math.abs(seconds) < 45) return 'Justo ahora';
    const [unit, size] = STEPS.find(([, size]) => Math.abs(seconds) >= size) ?? ['minute', 60];
    return relative.format(Math.round(seconds / size), unit);
}

/** Agrega al inicio una notificación recién llegada, sin duplicarla. */
export const prependNotification = (feed: NotificationFeed | undefined, notification: AppNotification): NotificationFeed => ({
    items: [notification, ...(feed?.items ?? []).filter((item) => item.id !== notification.id)],
    unread_count: (feed?.unread_count ?? 0) + (feed?.items.some((item) => item.id === notification.id) ? 0 : 1),
});

/** Marca como leída una notificación (o todas, sin id) y ajusta el contador. */
export function markFeedRead(feed: NotificationFeed | undefined, id?: string): NotificationFeed | undefined {
    if (!feed) return feed;
    const readAt = new Date().toISOString();
    if (id === undefined) {
        return { items: feed.items.map((item) => item.read_at ? item : { ...item, read_at: readAt }), unread_count: 0 };
    }
    const target = feed.items.find((item) => item.id === id);
    if (!target || target.read_at) return feed;
    return {
        items: feed.items.map((item) => item.id === id ? { ...item, read_at: readAt } : item),
        unread_count: Math.max(0, feed.unread_count - 1),
    };
}
