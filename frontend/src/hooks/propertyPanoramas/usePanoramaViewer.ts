import { useEffect, useRef, useState } from 'react';
import type { Viewer } from '@photo-sphere-viewer/core';
import { VIEWER_LANG, VIEWER_NAVBAR } from '../../constants/panoramas';
import { propertyImageUrl } from '../../utils/imageUrl';

/**
 * Monta Photo Sphere Viewer en el contenedor. La librería (y three.js) se descarga solo
 * cuando se abre el recorrido, así quien no lo usa no paga ese peso.
 */
export function usePanoramaViewer(path: string, title: string) {
    const container = useRef<HTMLDivElement>(null);
    const viewer = useRef<Viewer | null>(null);
    const [error, setError] = useState(false);
    const url = propertyImageUrl(path);
    // Datos iniciales para el montaje; los cambios posteriores los aplica el efecto de abajo.
    const initial = useRef({ url, title });

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const [{ Viewer }, { AutorotatePlugin }, { GyroscopePlugin }] = await Promise.all([
                import('@photo-sphere-viewer/core'),
                import('@photo-sphere-viewer/autorotate-plugin'),
                import('@photo-sphere-viewer/gyroscope-plugin'),
                import('@photo-sphere-viewer/core/index.css'),
            ]);
            if (cancelled || !container.current) return;

            viewer.current = new Viewer({
                container: container.current,
                panorama: initial.current.url,
                caption: initial.current.title,
                navbar: VIEWER_NAVBAR,
                lang: VIEWER_LANG,
                defaultZoomLvl: 30,
                // Dentro de la página, la rueda del mouse sigue desplazando la página salvo con Ctrl.
                mousewheelCtrlKey: true,
                plugins: [
                    [AutorotatePlugin, { autostartDelay: 1500, autostartOnIdle: true, autorotateSpeed: '1rpm', autorotatePitch: 0 }],
                    GyroscopePlugin,
                ],
            });
        })().catch(() => {
            if (!cancelled) setError(true);
        });

        return () => {
            cancelled = true;
            viewer.current?.destroy();
            viewer.current = null;
        };
    }, []);

    // Cambio de espacio: transición con fundido sin volver a montar el visor.
    useEffect(() => {
        if (!viewer.current || viewer.current.config.panorama === url) return;
        setError(false);
        viewer.current
            .setPanorama(url, { caption: title, transition: { effect: 'fade', rotation: true } })
            .catch(() => setError(true));
    }, [url, title]);

    return { container, error };
}
