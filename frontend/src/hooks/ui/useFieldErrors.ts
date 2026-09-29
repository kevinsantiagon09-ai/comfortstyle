import { useCallback, useState } from 'react';
import type { FieldErrors } from '../../types/api';
import { without } from '../../utils/propertyForm';

/** Errores por campo de un formulario, con utilidades para limpiarlos al corregir. */
export function useFieldErrors() {
    const [errors, setErrors] = useState<FieldErrors>({});
    const clearError = useCallback((key: string) => {
        setErrors((current) => key in current ? without(current, key) : current);
    }, []);

    return {
        errors,
        setErrors,
        clearError,
        hasErrors: Object.keys(errors).length > 0,
    };
}
