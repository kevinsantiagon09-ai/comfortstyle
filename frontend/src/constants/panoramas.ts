import { Bath, BedDouble, CookingPot, Sofa, TreePine, UtensilsCrossed } from 'lucide-react';
import type { PanoramaSlot } from '../types/panorama';

/** Deben coincidir con StorePropertyPanoramaRequest y PropertyPanoramaService del backend. */
export const MAX_PANORAMAS = 10;
export const MAX_PANORAMA_SIZE = 100 * 1024 * 1024;
export const MIN_PANORAMA_WIDTH = 2000;
/** Se acepta cualquier foto: las que no son 360° reales se convierten en el navegador a un panorama 2:1 (siempre se envía JPG). */
export const ACCEPTED_PANORAMA_TYPES = ['image/jpeg', 'image/webp', 'image/png'];

/** Ancho del panorama que se genera a partir de una foto común (alto = ancho / 2). */
export const SIMULATED_PANORAMA_WIDTH = 4096;

/** Desde esta proporción (ancho / alto) una foto se considera panorámica y se extiende por toda la esfera. */
export const WIDE_PHOTO_ASPECT = 1.4;


/** Ancho de la vista previa liviana que se genera en el navegador (alto = ancho / 2). */
export const PANORAMA_PREVIEW_WIDTH = 1024;

/** Botones de la barra del visor 360°. El giroscopio solo aparece en dispositivos que lo tienen. */
export const VIEWER_NAVBAR = ['autorotate', 'zoom', 'gyroscope', 'fullscreen'];

export const VIEWER_LANG = {
    zoom: 'Zoom',
    zoomOut: 'Alejar',
    zoomIn: 'Acercar',
    moveUp: 'Mirar arriba',
    moveDown: 'Mirar abajo',
    moveLeft: 'Mirar a la izquierda',
    moveRight: 'Mirar a la derecha',
    fullscreen: 'Pantalla completa',
    loading: 'Cargando recorrido...',
    close: 'Cerrar',
    twoFingers: 'Usa dos dedos para moverte',
    ctrlZoom: 'Usa Ctrl + rueda del mouse para acercar',
    loadError: 'No fue posible cargar este espacio',
    webglError: 'Tu navegador no permite ver recorridos 360°',
    autorotate: 'Giro automático',
    gyroscope: 'Mover con el teléfono',
};

/** Espacios típicos que se ofrecen al registrar: uno por contenedor, en una cuadrícula de 6. */
export const PANORAMA_SLOTS: PanoramaSlot[] = [
    { key: 'sala', title: 'Sala', icon: Sofa },
    { key: 'cocina', title: 'Cocina', icon: CookingPot },
    { key: 'habitacion', title: 'Habitación', icon: BedDouble },
    { key: 'bano', title: 'Baño', icon: Bath },
    { key: 'comedor', title: 'Comedor', icon: UtensilsCrossed },
    { key: 'terraza', title: 'Terraza', icon: TreePine },
];
