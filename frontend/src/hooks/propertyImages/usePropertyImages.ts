import { useQuery } from '@tanstack/react-query';
import { getPropertyImages } from '../../api/propertyImages.api';
import { queryKeys } from '../../api/queryKeys';

export function usePropertyImages(propertyId: number) {
    return useQuery({
        queryKey: queryKeys.propertyImages(propertyId),
        queryFn: ({ signal }) => getPropertyImages(propertyId, signal),
        enabled: propertyId > 0,
    });
}
