import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPropertyType } from '../../api/propertyTypes.api';
import { queryKeys } from '../../api/queryKeys';
import type { PropertyType } from '../../types/propertyType';
import { upsertPropertyType } from '../../utils/propertyTypes';

export function useCreatePropertyType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPropertyType,
        // Se agrega a la caché al instante para poder seleccionarlo sin esperar otra consulta.
        onSuccess: (type) => queryClient.setQueryData<PropertyType[]>(queryKeys.hostPropertyTypes, (types) => upsertPropertyType(types, type)),
    });
}
