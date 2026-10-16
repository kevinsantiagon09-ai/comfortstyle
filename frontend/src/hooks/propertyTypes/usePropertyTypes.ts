import { useQuery } from '@tanstack/react-query';
import { getPropertyTypes } from '../../api/propertyTypes.api';
import { queryKeys } from '../../api/queryKeys';

export function usePropertyTypes() {
    return useQuery({
        queryKey: queryKeys.propertyTypes,
        queryFn: ({ signal }) => getPropertyTypes(signal),
        staleTime: 3_600_000,
    });
}
