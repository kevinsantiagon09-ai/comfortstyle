import { useQuery } from '@tanstack/react-query';
import { getHostProperty } from '../../api/properties.api';
import { queryKeys } from '../../api/queryKeys';

export function useHostProperty(uuid: string) {
    return useQuery({
        queryKey: queryKeys.hostProperty(uuid),
        queryFn: ({ signal }) => getHostProperty(uuid, signal),
        enabled: uuid !== '',
    });
}
