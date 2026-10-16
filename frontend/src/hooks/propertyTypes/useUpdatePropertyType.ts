import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePropertyType } from '../../api/propertyTypes.api';
import { queryKeys } from '../../api/queryKeys';
import type { PropertyType, UpdatePropertyTypeVariables } from '../../types/propertyType';
import { upsertPropertyType } from '../../utils/propertyTypes';

export function useUpdatePropertyType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ uuid, data }: UpdatePropertyTypeVariables) => updatePropertyType(uuid, data),
        onSuccess: (type) => {
            queryClient.setQueryData<PropertyType[]>(queryKeys.hostPropertyTypes, (types) => upsertPropertyType(types, type));
            // Las tarjetas de "Mis alojamientos" muestran el nombre del tipo.
            void queryClient.invalidateQueries({ queryKey: queryKeys.hostProperties });
        },
    });
}
