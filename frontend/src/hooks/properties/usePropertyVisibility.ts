import { useMutation } from '@tanstack/react-query';
import { setPropertyVisibility } from '../../api/properties.api';
import type { Property } from '../../types/property';
import { apiError } from '../../utils/apiError';
import { usePropertyCacheSync } from './usePropertyCacheSync';

/** Interruptor Publicado/Oculto del alojamiento. Se guarda al instante, aparte del formulario. */
export function usePropertyVisibility(property: Property) {
    const syncProperty = usePropertyCacheSync();
    const visibility = useMutation({
        mutationFn: (isActive: boolean) => setPropertyVisibility(property.uuid, isActive),
        onSuccess: syncProperty,
    });
    // Mientras se guarda se muestra el estado pedido, para que el interruptor responda sin esperar.
    const isActive = (visibility.isPending ? visibility.variables : undefined) ?? property.is_active;

    return {
        isActive,
        pending: visibility.isPending,
        toggle: () => {
            if (!visibility.isPending) visibility.mutate(!property.is_active);
        },
        error: visibility.isError ? apiError(visibility.error) : null,
    };
}
