import L from 'leaflet';
import type { MapPoint } from '../types/map';

/** Pin propio en HTML: evita los problemas de rutas de los iconos por defecto de Leaflet con el empaquetador. */
export const pinIcon = L.divIcon({
    className: '',
    html: '<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 42 16 42s16-14.5 16-26.3C32 7 24.8 0 16 0z" fill="#1d4ed8"/><circle cx="16" cy="15.5" r="6" fill="#fff"/></svg>',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
});

/** Texto del formulario → punto válido, o `null` si falta o no es numérico. */
export function toMapPoint(latitude: string, longitude: string): MapPoint | null {
    if (latitude.trim() === '' || longitude.trim() === '') return null;
    const lat = Number(latitude);
    const lng = Number(longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

/** 6 decimales (~10 cm) bastan y evitan cifras interminables. */
export const formatCoordinate = (value: number) => value.toFixed(6);
