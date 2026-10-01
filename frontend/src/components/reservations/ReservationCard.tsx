import { Link } from 'react-router-dom';
import { propertyDetailPath } from '../../routes/paths';
import type { ReservationCardProps } from '../../types/reservation';
import { canCancel, formatMoney } from '../../utils/reservation';

export default function ReservationCard({ reservation, cancelling, onCancel }: ReservationCardProps) {
    const cancelled = reservation.status === 'CANCELADA';

    return (
        <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-5">
            <div>
                <Link to={propertyDetailPath(reservation.property_id)} className="text-lg font-semibold text-slate-900 hover:underline">
                    {reservation.property?.name}
                </Link>
                <p className="text-sm text-slate-600">{reservation.property?.city}, {reservation.property?.department}</p>
                <p className="mt-2 text-sm text-slate-700">
                    {reservation.check_in} → {reservation.check_out} · {reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'} · {reservation.guests} {reservation.guests === 1 ? 'huésped' : 'huéspedes'}
                </p>
                <p className="text-sm font-semibold text-slate-900">${formatMoney(reservation.total_price)} {reservation.currency}</p>
            </div>

            <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cancelled ? 'bg-slate-100 text-slate-600' : 'bg-green-50 text-green-700'}`}>
                    {cancelled ? 'Cancelada' : 'Confirmada'}
                </span>
                {canCancel(reservation) && (
                    <button
                        type="button"
                        disabled={cancelling}
                        onClick={() => onCancel(reservation.id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                    >
                        {cancelling ? 'Cancelando...' : 'Cancelar'}
                    </button>
                )}
            </div>
        </article>
    );
}
