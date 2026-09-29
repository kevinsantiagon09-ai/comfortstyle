import { useQuery } from '@tanstack/react-query';
import { getAmenities } from '../../api/amenities.api';
import { queryKeys } from '../../api/queryKeys';

export function useAmenities() {
    return useQuery({
        queryKey: queryKeys.amenities,
        queryFn: ({ signal }) => getAmenities(signal),
        staleTime: 3_600_000,
    });
}
