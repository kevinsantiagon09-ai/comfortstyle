import { useState } from 'react';
import { hasSetupProgress, usePropertySetupStore } from '../../store/propertySetupStore';
import { useHostProperties } from './useHostProperties';

export function useHostDashboard() {
    const [page, setPage] = useState(1);
    const properties = useHostProperties(page);
    /** Nombre del registro sin terminar guardado en este navegador, si existe. */
    const localDraft = usePropertySetupStore((state) => hasSetupProgress(state) ? state.form.name.trim() || 'Sin nombre' : null);

    return {
        page,
        properties,
        result: properties.data,
        localDraft,
        previousPage: () => setPage((current) => current - 1),
        nextPage: () => setPage((current) => current + 1),
    };
}
