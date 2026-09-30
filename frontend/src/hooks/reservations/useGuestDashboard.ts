import { useState } from 'react';
import { apiError } from '../../utils/apiError';
import { useCancelReservation } from './useCancelReservation';
import { useMyReservations } from './useMyReservations';

export function useGuestDashboard() {
    const [page, setPage] = useState(1);
    const reservations = useMyReservations(page);
    const cancel = useCancelReservation();

    return {
        page,
        reservations,
        result: reservations.data,
        cancel: (id: number) => cancel.mutate(id),
        cancellingId: cancel.isPending ? cancel.variables : null,
        cancelError: cancel.isError ? apiError(cancel.error) : null,
        previousPage: () => setPage((current) => current - 1),
        nextPage: () => setPage((current) => current + 1),
    };
}
