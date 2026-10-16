import { useEffect, useRef, useState } from 'react';

/** Cierra algo después de unos segundos, salvo mientras el puntero esté encima. */
export function useAutoDismiss(onDismiss: () => void, seconds: number) {
    const [paused, setPaused] = useState(false);
    // Se guarda la última función para que un nuevo render no reinicie la cuenta.
    const dismissRef = useRef(onDismiss);
    useEffect(() => {
        dismissRef.current = onDismiss;
    });

    useEffect(() => {
        if (paused) return;
        const timer = window.setTimeout(() => dismissRef.current(), seconds * 1000);
        return () => window.clearTimeout(timer);
    }, [paused, seconds]);

    return {
        onMouseEnter: () => setPaused(true),
        onMouseLeave: () => setPaused(false),
    };
}
