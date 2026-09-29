import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '../../api/locations.api';
import { queryKeys } from '../../api/queryKeys';

export function useDepartments() {
    return useQuery({
        queryKey: queryKeys.departments,
        queryFn: ({ signal }) => getDepartments(signal),
        staleTime: 3_600_000,
    });
}
