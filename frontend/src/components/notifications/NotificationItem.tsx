import type { NotificationItemProps } from '../../types/notification';
import { timeAgo } from '../../utils/notifications';
import NotificationAvatar from './NotificationAvatar';

export default function NotificationItem({ notification, onOpen }: NotificationItemProps) {
    const unread = !notification.read_at;

    return <li>
        <button type="button" onClick={() => onOpen(notification)} className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100 ${unread ? 'bg-blue-50/60' : ''}`}>
            <NotificationAvatar notification={notification} />
            <span className="min-w-0 flex-1">
                <span className={`block text-sm leading-snug ${unread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{notification.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{notification.body}</span>
                <span className={`mt-1 block text-xs font-semibold ${unread ? 'text-blue-700' : 'text-slate-400'}`}>{timeAgo(notification.created_at)}</span>
            </span>
            {unread && <span aria-label="Sin leer" className="mt-4 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />}
        </button>
    </li>;
}
