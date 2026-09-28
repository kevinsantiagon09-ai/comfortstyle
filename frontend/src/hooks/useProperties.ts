import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../api/properties.api';

export function useProperties() {
    const query = useQuery({
        queryKey: ['properties', 'public'],
        queryFn: ({ signal }) => getProperties(signal),
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
