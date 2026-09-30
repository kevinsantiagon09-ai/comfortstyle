import { useEffect, useState } from 'react';
import type { PropertyPanorama } from '../../types/panorama';

/** Abre y cierra el recorrido en el detalle del alojamiento, en el lugar de la galería. */
export function useVirtualTour(panoramas: PropertyPanorama[] = [], reservationId: string) {
    const [open, setOpen] = useState(false);

    // Escape cierra el recorrido (en pantalla completa el navegador primero sale de ella).
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !document.fullscreenElement) setOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return {
        hasTour: panoramas.length > 0,
        open,
        previewPath: panoramas[0]?.preview_path ?? '',
        openTour: () => setOpen(true),
        close: () => setOpen(false),
        /** Del "me gustó" al "lo quiero": cierra el recorrido y lleva al formulario de reserva. */
        goToReservation: () => {
            setOpen(false);
            requestAnimationFrame(() => document.getElementById(reservationId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        },
    };
}
