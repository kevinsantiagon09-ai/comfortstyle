import { CalendarCheck2, CalendarPlus2, CalendarX2 } from 'lucide-react';
import { paths } from '../routes/paths';
import type { NotificationKind, NotificationKindStyle } from '../types/notification';

/** Cada notificación lleva un distintivo de color sobre la foto, como las redes sociales. */
export const NOTIFICATION_KINDS: Record<NotificationKind, NotificationKindStyle> = {
    reservation_received: { icon: CalendarPlus2, badgeClass: 'bg-emerald-500', target: paths.host },
    reservation_confirmed: { icon: CalendarCheck2, badgeClass: 'bg-blue-600', target: paths.guest },
    reservation_cancelled: { icon: CalendarX2, badgeClass: 'bg-rose-500', target: paths.host },
};

/** Segundos que un aviso emergente queda en pantalla. */
export const TOAST_SECONDS = 7;
