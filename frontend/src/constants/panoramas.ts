/** Deben coincidir con StorePropertyPanoramaRequest y PropertyPanoramaService del backend. */
export const MAX_PANORAMAS = 10;
export const MAX_PANORAMA_SIZE = 20 * 1024 * 1024;
export const MIN_PANORAMA_WIDTH = 2000;
export const ACCEPTED_PANORAMA_TYPES = ['image/jpeg', 'image/webp'];

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
