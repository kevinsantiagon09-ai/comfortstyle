import { useNotificationStream } from '../../hooks/notifications/useNotificationStream';
import { useNotificationToasts } from '../../hooks/notifications/useNotificationToasts';
import NotificationToastCard from './NotificationToastCard';

/** Escucha Reverb mientras hay sesión y apila los avisos emergentes en la esquina inferior izquierda. */
export default function RealtimeNotifications() {
    useNotificationStream();
    const { toasts, dismiss, open } = useNotificationToasts();

    return <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-[60] flex flex-col-reverse gap-3">
        {toasts.map((notification) => <NotificationToastCard key={notification.id} notification={notification} onOpen={() => open(notification)} onClose={() => dismiss(notification.id)} />)}
    </div>;
}
