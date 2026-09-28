import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getHostProperties, getHostProperty, getPropertyImages, publishProperty, updateProperty, uploadImage, type PropertyInput } from '../api/hostProperties.api';
import { propertyKeys } from '../api/queryKeys';

export function useHostProperties(page: number) {
    return useQuery({
        queryKey: propertyKeys.hostList(page),
        queryFn: ({ signal }) => getHostProperties(page, signal),
        placeholderData: keepPreviousData,
    });
}

export function useHostProperty(id: number) {
    return useQuery({ queryKey: propertyKeys.hostDetail(id), queryFn: ({ signal }) => getHostProperty(id, signal), enabled: id > 0 });
}

export function usePropertyImages(propertyId: number) {
    return useQuery({ queryKey: propertyKeys.images(propertyId), queryFn: ({ signal }) => getPropertyImages(propertyId, signal) });
}

/** Sube los archivos uno por uno para conservar su orden; si uno falla, los anteriores quedan guardados. */
export function useUploadPropertyImages(propertyId: number) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (files: File[]) => {
            for (const file of files) await uploadImage(propertyId, file);
        },
        onSettled: () => client.invalidateQueries({ queryKey: propertyKeys.images(propertyId) }),
    });
}

export function usePublishProperty(propertyId: number) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: () => publishProperty(propertyId),
        onSuccess: (property) => {
            client.setQueryData(propertyKeys.hostDetail(propertyId), property);
            void client.invalidateQueries({ queryKey: propertyKeys.hostAll });
            void client.invalidateQueries({ queryKey: ['properties', 'public'] });
        },
    });
}

export function useUpdateProperty(propertyId: number) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (data: PropertyInput) => updateProperty(propertyId, data),
        onSuccess: (property) => {
            client.setQueryData(propertyKeys.hostDetail(propertyId), property);
            void client.invalidateQueries({ queryKey: propertyKeys.hostAll });
            void client.invalidateQueries({ queryKey: ['properties', 'public'] });
        },
    });
}
