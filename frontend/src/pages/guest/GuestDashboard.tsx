import ReservationCard from '../../components/reservations/ReservationCard';
import Pagination from '../../components/ui/Pagination';
import { useGuestDashboard } from '../../hooks/reservations/useGuestDashboard';

export default function GuestDashboard() {
    const { page, reservations, result, cancel, cancellingId, cancelError, previousPage, nextPage } = useGuestDashboard();

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold">Mis reservas</h1>
                <p className="mt-2 text-slate-600">Consulta y administra tus reservas.</p>
            </header>

            {cancelError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{cancelError}</p>}
            {reservations.isPending && <p className="text-slate-600">Cargando reservas...</p>}
            {reservations.isError && <p className="rounded-xl bg-red-50 p-4 text-red-700">No fue posible cargar tus reservas.</p>}
            {result && result.data.length === 0 && <p className="text-slate-600">Aún no tienes reservas.</p>}

            <div className="space-y-4">
                {result?.data.map((reservation) => (
                    <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        cancelling={cancellingId === reservation.id}
                        onCancel={cancel}
                    />
                ))}
            </div>

            {result && result.last_page > 1 && (
                <Pagination
                    page={page}
                    currentPage={result.current_page}
                    lastPage={result.last_page}
                    onPrevious={previousPage}
                    onNext={nextPage}
                    nextDisabled={reservations.isPlaceholderData}
                />
            )}
        </section>
    );
}
