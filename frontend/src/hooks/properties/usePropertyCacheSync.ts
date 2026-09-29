import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../api/queryKeys';
import type { Property } from '../../types/property';

/** Tras guardar un alojamiento: actualiza su detalle en caché y refresca los listados que lo muestran. */
export function usePropertyCacheSync() {
    const client = useQueryClient();

    return (property: Property) => {
        client.setQueryData(queryKeys.hostProperty(property.id), property);
        void client.invalidateQueries({ queryKey: queryKeys.hostProperties });
        void client.invalidateQueries({ queryKey: queryKeys.publicProperties });
    };
}
