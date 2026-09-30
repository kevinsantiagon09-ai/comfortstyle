import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProperty } from '../../api/properties.api';
import { uploadPropertyPanorama } from '../../api/propertyPanoramas.api';
import { queryKeys } from '../../api/queryKeys';
import type { PanoramaDrafts } from '../../types/panorama';
import type { Property, PropertyInput } from '../../types/property';
import { apiError, fieldErrors } from '../../utils/apiError';
import { usePropertyCacheSync } from './usePropertyCacheSync';

export interface CreatedProperty {
    id: number;
    uuid: string;
}

interface CreatePropertyVariables {
    data: PropertyInput;
    images: File[];
    panoramas?: PanoramaDrafts;
    /** Alojamiento ya creado: solo se reintentan las fotos 360° que fallaron. */
    existing?: CreatedProperty;
}

export function useCreateProperty() {
    const syncProperty = usePropertyCacheSync();
    const client = useQueryClient();

    return useMutation({
        /**
         * Las fotos 360° necesitan el id del alojamiento: se suben una a una después de crearlo.
         * Los errores del backend (validación del request) se devuelven por espacio para mostrarlos en su contenedor.
         */
        mutationFn: async ({ data, images, panoramas = {}, existing }: CreatePropertyVariables) => {
            const property: Property | null = existing ? null : await createProperty(data, images);
            const created: CreatedProperty = existing ?? { id: property!.id, uuid: property!.uuid };
            const failures: Record<string, string> = {};
            for (const [key, upload] of Object.entries(panoramas)) {
                try {
                    await uploadPropertyPanorama(created.id, upload);
                } catch (error) {
                    failures[key] = Object.values(fieldErrors(error)).join(' ') || apiError(error);
                }
            }
            if (Object.keys(panoramas).length > 0) await client.invalidateQueries({ queryKey: queryKeys.propertyPanoramas(created.id) });
            return { property, created, failures };
        },
        onSuccess: ({ property }) => { if (property) syncProperty(property); },
    });
}
