import { useQuery } from '@tanstack/react-query';
import { geocodePlace } from '../../api/geocoding.api';
import { queryKeys } from '../../api/queryKeys';

/** Un lugar no se mueve: se busca una vez y queda en caché toda la sesión. */
export function useGeocodedPlace(place: string, enabled: boolean) {
    return useQuery({
        queryKey: queryKeys.geocode(place),
        queryFn: ({ signal }) => geocodePlace(place, signal),
        enabled: enabled && place !== '',
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 1,
    });
}
