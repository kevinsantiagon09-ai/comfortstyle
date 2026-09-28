import { useQuery } from '@tanstack/react-query';
import { getAmenities } from '../api/hostProperties.api';

export function useAmenities() {
    return useQuery({ queryKey: ['amenities'], queryFn: ({ signal }) => getAmenities(signal), staleTime: 3_600_000 });
}
