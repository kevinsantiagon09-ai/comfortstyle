import { useMutation } from '@tanstack/react-query';
import { validatePropertyFields } from '../../api/properties.api';
import type { PropertyInput } from '../../types/property';

/** Valida en el backend los campos de un paso, sin guardar nada. */
export function useValidatePropertyFields() {
    return useMutation({
        mutationFn: ({ data, fields }: { data: Partial<PropertyInput>; fields: (keyof PropertyInput)[] }) =>
            validatePropertyFields(data, fields),
    });
}
