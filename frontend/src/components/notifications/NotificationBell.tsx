import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useNotificationBell } from '../../hooks/notifications/useNotificationBell';
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
    const { containerRef, ...bell } = useNotificationBell();
    const tabClass = (active: boolean) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`;

    return <div ref={containerRef} className="relative">
        <button type="button" onClick={bell.toggle} aria-expanded={bell.open} aria-haspopup="dialog"
            aria-label={bell.unreadCount > 0 ? `Notificaciones, ${bell.unreadCount} sin leer` : 'Notificaciones'}
            className={`relative grid h-10 w-10 place-items-center rounded-full transition ${bell.open ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Bell aria-hidden="true" className="h-5 w-5" />
            {bell.unreadCount > 0 && <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">{bell.unreadCount > 9 ? '9+' : bell.unreadCount}</span>}
        </button>

        {bell.open && <div role="dialog" aria-label="Notificaciones" className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
            <div className="flex items-center justify-between px-4 pt-4">
                <h2 className="text-xl font-extrabold text-slate-900">Notificaciones</h2>
                <button type="button" onClick={bell.markAllRead} disabled={!bell.canMarkAll} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:text-slate-300 disabled:hover:bg-transparent">
                    <CheckCheck aria-hidden="true" className="h-4 w-4" />Marcar todo como leído
                </button>
            </div>
            <div className="flex gap-1 px-4 pt-3 pb-2">
                <button type="button" onClick={() => bell.setFilter('all')} className={tabClass(bell.filter === 'all')}>Todas</button>
                <button type="button" onClick={() => bell.setFilter('unread')} className={tabClass(bell.filter === 'unread')}>No leídas{bell.unreadCount > 0 ? ` (${bell.unreadCount})` : ''}</button>
            </div>

            <div className="max-h-[26rem] overflow-y-auto px-2 pb-2">
                {bell.loading ? <p role="status" className="px-3 py-8 text-center text-sm text-slate-500">Cargando notificaciones…</p>
                    : bell.failed ? <p role="alert" className="px-3 py-8 text-center text-sm text-slate-600">No pudimos cargar tus notificaciones. <button type="button" onClick={bell.retry} className="font-semibold text-blue-700 underline">Reintentar</button></p>
                    : bell.items.length === 0 ? <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400"><BellOff aria-hidden="true" className="h-6 w-6" /></span>
                        <p className="font-semibold text-slate-800">{bell.filter === 'unread' ? 'Estás al día' : 'Aún no tienes notificaciones'}</p>
                        <p className="text-sm text-slate-500">Aquí verás las reservas y cancelaciones en cuanto ocurran.</p>
                    </div>
                    : <ul className="space-y-0.5">{bell.items.map((notification) => <NotificationItem key={notification.id} notification={notification} onOpen={bell.openNotification} />)}</ul>}
            </div>
        </div>}
    </div>;
}
