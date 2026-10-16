import { useNavigate } from 'react-router-dom';
import { NOTIFICATION_KINDS } from '../../constants/notifications';
import { useNotificationToastStore } from '../../store/notificationToastStore';
import type { AppNotification } from '../../types/notification';
import { useMarkNotificationRead } from './useMarkNotificationRead';

/** Avisos emergentes: al abrir uno se marca leído y lleva a su pantalla. */
export function useNotificationToasts() {
    const toasts = useNotificationToastStore((state) => state.toasts);
    const dismiss = useNotificationToastStore((state) => state.dismiss);
    const markRead = useMarkNotificationRead();
    const navigate = useNavigate();

    return {
        toasts,
        dismiss,
        open: (notification: AppNotification) => {
            markRead.mutate(notification.id);
            dismiss(notification.id);
            navigate(NOTIFICATION_KINDS[notification.kind].target);
        },
    };
}
