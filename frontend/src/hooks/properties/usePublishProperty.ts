import { useMutation } from '@tanstack/react-query';
import { publishProperty } from '../../api/properties.api';
import { usePropertyCacheSync } from './usePropertyCacheSync';

export function usePublishProperty(propertyId: number) {
    const syncProperty = usePropertyCacheSync();

    return useMutation({
        mutationFn: () => publishProperty(propertyId),
        onSuccess: syncProperty,
    });
}
