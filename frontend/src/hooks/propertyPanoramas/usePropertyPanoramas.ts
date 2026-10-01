import { useQuery } from '@tanstack/react-query';
import { getPropertyPanoramas } from '../../api/propertyPanoramas.api';
import { queryKeys } from '../../api/queryKeys';

export function usePropertyPanoramas(propertyId: number) {
    return useQuery({
        queryKey: queryKeys.propertyPanoramas(propertyId),
        queryFn: ({ signal }) => getPropertyPanoramas(propertyId, signal),
    });
}
