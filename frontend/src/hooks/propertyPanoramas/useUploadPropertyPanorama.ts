import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadPropertyPanorama } from '../../api/propertyPanoramas.api';
import { queryKeys } from '../../api/queryKeys';
import type { PanoramaUpload } from '../../types/panorama';

/** Sube un espacio del recorrido y refresca tanto la lista del anfitrión como el detalle público. */
export function useUploadPropertyPanorama(propertyId: number) {
    const client = useQueryClient();
    const [progress, setProgress] = useState(0);

    const mutation = useMutation({
        mutationFn: (upload: PanoramaUpload) => {
            setProgress(0);
            return uploadPropertyPanorama(propertyId, upload, setProgress);
        },
        onSettled: () => Promise.all([
            client.invalidateQueries({ queryKey: queryKeys.propertyPanoramas(propertyId) }),
            client.invalidateQueries({ queryKey: queryKeys.publicProperty(propertyId) }),
        ]),
    });

    return { ...mutation, progress };
}
