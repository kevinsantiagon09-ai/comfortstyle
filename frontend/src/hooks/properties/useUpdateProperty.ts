import { useMutation } from '@tanstack/react-query';
import { updateProperty } from '../../api/properties.api';
import type { PropertyInput } from '../../types/property';
import { usePropertyCacheSync } from './usePropertyCacheSync';

export function useUpdateProperty(propertyUuid: string) {
    const syncProperty = usePropertyCacheSync();

    return useMutation({
        mutationFn: (data: PropertyInput) => updateProperty(propertyUuid, data),
        onSuccess: syncProperty,
    });
}
