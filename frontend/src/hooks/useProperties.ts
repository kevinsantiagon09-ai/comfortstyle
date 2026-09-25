import { useCallback, useEffect, useState } from 'react';
import { getProperties } from '../api/properties.api';
import type { Property } from '../types/property';

export function useProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [request, setRequest] = useState(0);
    const reload = useCallback(() => {
        setLoading(true);
        setError(null);
        setRequest((value) => value + 1);
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        getProperties(controller.signal).then((data) => {
            if (!controller.signal.aborted) setProperties(data);
        }).catch(() => {
            if (!controller.signal.aborted) setError('No fue posible cargar los alojamientos.');
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [request]);
    return { properties, loading, error, reload };
}
