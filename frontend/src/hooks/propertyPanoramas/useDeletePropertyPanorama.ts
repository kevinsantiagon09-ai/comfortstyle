import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePropertyPanorama } from '../../api/propertyPanoramas.api';
import { queryKeys } from '../../api/queryKeys';

export function useDeletePropertyPanorama(propertyId: number) {
    const client = useQueryClient();

    return useMutation({
        mutationFn: deletePropertyPanorama,
        onSettled: () => Promise.all([
            client.invalidateQueries({ queryKey: queryKeys.propertyPanoramas(propertyId) }),
            client.invalidateQueries({ queryKey: queryKeys.publicProperty(propertyId) }),
        ]),
    });
}
