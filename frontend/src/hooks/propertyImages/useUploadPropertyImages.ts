import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadPropertyImage } from '../../api/propertyImages.api';
import { queryKeys } from '../../api/queryKeys';

/** Sube los archivos uno por uno para conservar su orden; si uno falla, los anteriores quedan guardados. */
export function useUploadPropertyImages(propertyId: number) {
    const client = useQueryClient();

    return useMutation({
        mutationFn: async (files: File[]) => {
            for (const file of files) await uploadPropertyImage(propertyId, file);
        },
        onSettled: () => client.invalidateQueries({ queryKey: queryKeys.propertyImages(propertyId) }),
    });
}
