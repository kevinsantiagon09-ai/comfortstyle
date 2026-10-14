import { useQuery } from '@tanstack/react-query';
import { getMapProperties } from '../../api/properties.api';
import { queryKeys } from '../../api/queryKeys';

export function useMapProperties() {
    return useQuery({
        queryKey: queryKeys.mapProperties,
        queryFn: ({ signal }) => getMapProperties(signal),
        staleTime: 5 * 60_000,
    });
}
