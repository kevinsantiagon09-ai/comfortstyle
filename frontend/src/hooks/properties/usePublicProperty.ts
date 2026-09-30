import { useQuery } from '@tanstack/react-query';
import { getPublicProperty } from '../../api/properties.api';
import { queryKeys } from '../../api/queryKeys';

export function usePublicProperty(uuid: string) {
    return useQuery({
        queryKey: queryKeys.publicProperty(uuid),
        queryFn: ({ signal }) => getPublicProperty(uuid, signal),
        enabled: uuid !== '',
        staleTime: 60_000,
        retry: 1,
    });
}
