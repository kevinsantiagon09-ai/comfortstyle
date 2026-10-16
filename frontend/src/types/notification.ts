import type { LucideIcon } from 'lucide-react';

export type NotificationKind = 'reservation_received' | 'reservation_confirmed' | 'reservation_cancelled';

export interface AppNotification {
    id: string;
    kind: NotificationKind;
    title: string;
    body: string;
    reservation_uuid: string;
    property_uuid: string;
    property_name: string;
    cover_path: string | null;
    actor_name: string;
    read_at: string | null;
    created_at: string;
}

/** Lo que llega por Reverb: los datos de la notificación sin fecha de lectura ni de creación. */
export type BroadcastNotificationPayload = Omit<AppNotification, 'read_at' | 'created_at'>;

/** Pestañas del panel de la campana. */
export type NotificationFilter = 'all' | 'unread';

/** Lo que devuelve la campana: las más recientes y cuántas faltan por leer. */
export interface NotificationFeed {
    items: AppNotification[];
    unread_count: number;
}

/** Avisos emergentes de notificaciones que acaban de llegar. */
export interface NotificationToastState {
    toasts: AppNotification[];
    push: (notification: AppNotification) => void;
    dismiss: (id: string) => void;
}

/** Cómo se presenta cada tipo: ícono, colores y a dónde lleva al abrirlo. */
export interface NotificationKindStyle {
    icon: LucideIcon;
    badgeClass: string;
    target: string;
}

// Props de componentes
export interface NotificationItemProps {
    notification: AppNotification;
    onOpen: (notification: AppNotification) => void;
}

export interface NotificationAvatarProps {
    notification: AppNotification;
    size?: 'md' | 'lg';
}

export interface NotificationToastCardProps {
    notification: AppNotification;
    onOpen: () => void;
    onClose: () => void;
}
