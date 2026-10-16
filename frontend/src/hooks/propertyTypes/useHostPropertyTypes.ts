import { useQuery } from '@tanstack/react-query';
import { getHostPropertyTypes } from '../../api/propertyTypes.api';
import { queryKeys } from '../../api/queryKeys';

export function useHostPropertyTypes() {
    return useQuery({
        queryKey: queryKeys.hostPropertyTypes,
        queryFn: ({ signal }) => getHostPropertyTypes(signal),
        staleTime: 3_600_000,
    });
}
