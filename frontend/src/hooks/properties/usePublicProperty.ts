import { useQuery } from '@tanstack/react-query';
import { getPublicProperty } from '../../api/properties.api';
import { queryKeys } from '../../api/queryKeys';

export function usePublicProperty(id: number) {
    return useQuery({
        queryKey: queryKeys.publicProperty(id),
        queryFn: ({ signal }) => getPublicProperty(id, signal),
        enabled: id > 0,
        staleTime: 60_000,
        retry: 1,
    });
}
