import { useState } from 'react';
import type { PropertyPanorama } from '../../types/panorama';

/** Espacio que se está viendo dentro del recorrido; empieza por el primero. */
export function useTourScenes(panoramas: PropertyPanorama[]) {
    const [activeIndex, setActiveIndex] = useState(0);

    return {
        activeIndex,
        current: panoramas[activeIndex] ?? panoramas[0],
        select: setActiveIndex,
    };
}
