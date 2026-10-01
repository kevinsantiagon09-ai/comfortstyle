import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservation } from '../../api/reservations.api';
import { queryKeys } from '../../api/queryKeys';

export function useCreateReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReservation,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.guestReservations }),
    });
}
