import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelReservation } from '../../api/reservations.api';
import { queryKeys } from '../../api/queryKeys';

export function useCancelReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelReservation,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.guestReservations }),
    });
}
