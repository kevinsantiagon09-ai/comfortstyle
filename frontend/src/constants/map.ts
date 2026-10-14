/** Centro inicial (Colombia) mientras el anfitrión no elige un punto. */
export const DEFAULT_MAP_CENTER: [number, number] = [4.5709, -74.2973];
export const DEFAULT_MAP_ZOOM = 5;
/** Zoom al que se acerca el mapa cuando ya hay un punto. */
export const POINT_MAP_ZOOM = 16;

export const MAP_TILES_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/**
 * Capas del explorador del detalle: OpenStreetMap y satélite de Esri con nombres de lugares encima.
 * Ninguna pide clave. (CARTO se descartó: sin clave devuelve mosaicos con «API KEY REQUIRED».)
 */
export const MAP_STYLES = {
    mapa: {
        url: MAP_TILES_URL,
        attribution: MAP_ATTRIBUTION,
        labelsUrl: null,
    },
    satelite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Imágenes &copy; Esri',
        labelsUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    },
} as const;

/** Vista desde la que «aterriza» la cámara al llegar a la sección. */
export const ARRIVAL_ZOOM = 6;
export const ARRIVAL_DURATION_S = 2.4;
/** Zoom final: más cerca si el anfitrión marcó el punto exacto. */
export const EXACT_ZOOM = 15;
export const APPROXIMATE_ZOOM = 13;
/** Radio del círculo cuando solo conocemos la ciudad. */
export const APPROXIMATE_RADIUS_M = 1500;
/** Cuántos alojamientos cercanos se muestran en el mapa y en la lista. */
export const NEARBY_LIMIT = 8;

export const GEOCODER_URL = 'https://nominatim.openstreetmap.org/search';
