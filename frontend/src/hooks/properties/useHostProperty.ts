import { useQuery } from '@tanstack/react-query';
import { getHostProperty } from '../../api/properties.api';
import { queryKeys } from '../../api/queryKeys';

export function useHostProperty(id: number) {
    return useQuery({
        queryKey: queryKeys.hostProperty(id),
        queryFn: ({ signal }) => getHostProperty(id, signal),
        enabled: id > 0,
    });
}
