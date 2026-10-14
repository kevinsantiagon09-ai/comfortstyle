import { useMutation } from '@tanstack/react-query';
import { publishProperty } from '../../api/properties.api';
import { usePropertyCacheSync } from './usePropertyCacheSync';

export function usePublishProperty(propertyUuid: string) {
    const syncProperty = usePropertyCacheSync();

    return useMutation({
        mutationFn: () => publishProperty(propertyUuid),
        onSuccess: syncProperty,
    });
}
