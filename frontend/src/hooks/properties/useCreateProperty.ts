import { useMutation } from '@tanstack/react-query';
import { createProperty } from '../../api/properties.api';
import type { PropertyInput } from '../../types/property';
import { usePropertyCacheSync } from './usePropertyCacheSync';

export function useCreateProperty() {
    const syncProperty = usePropertyCacheSync();

    return useMutation({
        mutationFn: ({ data, images }: { data: PropertyInput; images: File[] }) => createProperty(data, images),
        onSuccess: syncProperty,
    });
}
