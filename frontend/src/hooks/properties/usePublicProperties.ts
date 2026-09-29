import { useQuery } from '@tanstack/react-query';
import { getPublicProperties } from '../../api/properties.api';
import { queryKeys } from '../../api/queryKeys';

export function usePublicProperties() {
    const query = useQuery({
        queryKey: queryKeys.publicProperties,
        queryFn: ({ signal }) => getPublicProperties(signal),
        staleTime: 60_000,
        retry: 1,
    });

    return {
        properties: query.data ?? [],
        loading: query.isPending || (query.isFetching && query.data === undefined),
        error: query.isError && !query.isFetching
            ? 'No fue posible cargar los alojamientos.'
            : null,
        reload: query.refetch,
    };
}
