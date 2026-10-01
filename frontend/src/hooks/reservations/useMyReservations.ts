import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getMyReservations } from '../../api/reservations.api';
import { queryKeys } from '../../api/queryKeys';

/** Reservas del huésped, paginadas; conserva la página anterior mientras carga la siguiente. */
export function useMyReservations(page: number) {
    return useQuery({
        queryKey: queryKeys.guestReservationList(page),
        queryFn: ({ signal }) => getMyReservations(page, signal),
        placeholderData: keepPreviousData,
    });
}
