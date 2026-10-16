import { create } from 'zustand';
import type { NotificationToastState } from '../types/notification';

/** Máximo de avisos emergentes a la vez; los más viejos se descartan. */
const MAX_TOASTS = 3;

/** Avisos emergentes de notificaciones recién llegadas. Es estado de la pantalla, no del servidor. */
export const useNotificationToastStore = create<NotificationToastState>()((set) => ({
    toasts: [],
    push: (notification) => set((state) => ({ toasts: [notification, ...state.toasts.filter((item) => item.id !== notification.id)].slice(0, MAX_TOASTS) })),
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));
