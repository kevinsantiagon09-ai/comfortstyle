import { X } from 'lucide-react';
import { TOAST_SECONDS } from '../../constants/notifications';
import { useAutoDismiss } from '../../hooks/ui/useAutoDismiss';
import type { NotificationToastCardProps } from '../../types/notification';
import NotificationAvatar from './NotificationAvatar';

export default function NotificationToastCard({ notification, onOpen, onClose }: NotificationToastCardProps) {
    const hover = useAutoDismiss(onClose, TOAST_SECONDS);

    return <div role="status" {...hover} className="toast-in pointer-events-auto flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/20">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
            <NotificationAvatar notification={notification} size="lg" />
            <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-700">Nueva notificación</span>
                <span className="mt-0.5 block text-sm font-semibold leading-snug text-slate-900">{notification.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{notification.body}</span>
            </span>
        </button>
        <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X aria-hidden="true" className="h-4 w-4" /></button>
    </div>;
}
