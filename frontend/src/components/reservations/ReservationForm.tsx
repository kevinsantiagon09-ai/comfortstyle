import { Link } from 'react-router-dom';
import { useReservationForm } from '../../hooks/reservations/useReservationForm';
import { paths } from '../../routes/paths';
import type { ReservationFormProps } from '../../types/reservation';
import FieldError from '../ui/FieldError';

export default function ReservationForm({ property }: ReservationFormProps) {
    const form = useReservationForm(property);

    if (!form.isAuthenticated) {
        return (
            <Link to={paths.login} className="block rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800">
                Inicia sesión para reservar
            </Link>
        );
    }
    if (!form.canReserve) {
        return <p className="text-sm text-slate-600">Solo las cuentas de huésped pueden reservar.</p>;
    }

    return (
        <form onSubmit={form.submit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-700">
                    Llegada
                    <input
                        type="date"
                        min={form.minCheckIn}
                        value={form.checkIn}
                        onChange={(event) => form.changeCheckIn(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                    <FieldError message={form.errors.check_in} />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Salida
                    <input
                        type="date"
                        min={form.checkIn || form.minCheckIn}
                        value={form.checkOut}
                        onChange={(event) => form.changeCheckOut(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                    <FieldError message={form.errors.check_out} />
                </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
                Huéspedes
                <input
                    type="number"
                    min={1}
                    max={form.maxGuests}
                    value={form.guests}
                    onChange={(event) => form.changeGuests(Number(event.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <FieldError message={form.errors.guests} />
            </label>

            {form.nights > 0 && (
                <p className="flex justify-between border-t border-slate-200 pt-3 text-slate-700">
                    <span>{form.nights} {form.nights === 1 ? 'noche' : 'noches'}</span>
                    <strong>${form.total} {property.currency}</strong>
                </p>
            )}

            {form.errors.property_id && <p role="alert" className="text-sm text-red-700">{form.errors.property_id}</p>}
            {form.formError && <p role="alert" className="text-sm text-red-700">{form.formError}</p>}

            <button
                type="submit"
                disabled={form.pending}
                className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
                {form.pending ? 'Reservando...' : 'Reservar'}
            </button>
        </form>
    );
}
