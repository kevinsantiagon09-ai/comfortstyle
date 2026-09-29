import { useQuery } from '@tanstack/react-query';
import { getCities } from '../../api/locations.api';
import { queryKeys } from '../../api/queryKeys';

export function useCities(departmentId: string) {
    return useQuery({
        queryKey: queryKeys.cities(departmentId),
        queryFn: ({ signal }) => getCities(departmentId, signal),
        enabled: Boolean(departmentId),
        staleTime: 3_600_000,
    });
}
