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

/** La casa que se está viendo: núcleo oscuro con ondas de radar que salen de él. */
export const homeIcon = L.divIcon({
    className: '',
    html: '<div class="map-home"><span class="map-home__ring"></span><span class="map-home__ring"></span><span class="map-home__core"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg></span></div>',
    iconSize: [56, 56],
    iconAnchor: [28, 28],
});

/**
 * Precio corto para la etiqueta del mapa: «$350 mil», «$1,25 M». Se arma a mano porque el formato compacto
 * de Intl cambia según el navegador («mil» o «k») y redondea demasiado los millones.
 */
export function shortPrice(price: string): string {
    const value = Number(price);
    if (value >= 1_000_000) return `$${(value / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 2 })} M`;
    if (value >= 1_000) return `$${(value / 1_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} mil`;
    return `$${value.toLocaleString('es-CO')}`;
}

const priceIcons = new Map<string, L.DivIcon>();

/**
 * Etiqueta con el precio de otro alojamiento. El icono nunca cambia (cambiarlo hace que Leaflet reemplace el
 * elemento bajo el cursor y la tarjeta parpadee): el resaltado se hace con la clase `is-active` vía `data-uuid`.
 */
export function priceIcon(uuid: string, price: string): L.DivIcon {
    const key = `${uuid}|${price}`;
    let icon = priceIcons.get(key);
    if (!icon) {
        icon = L.divIcon({ className: '', html: `<span class="map-price" data-uuid="${uuid}">${shortPrice(price)}</span>`, iconSize: [0, 0] });
        priceIcons.set(key, icon);
    }
    return icon;
}

/** Distancia en línea recta entre dos puntos (fórmula del haverseno), en km. */
export function distanceKm(a: MapPoint, b: MapPoint): number {
    const rad = (degrees: number) => (degrees * Math.PI) / 180;
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** «430 m», «2,3 km», «13 km»; por debajo de 1 km se redondea a decenas de metros. */
export function formatDistance(km: number): string {
    const meters = Math.round(km * 100) * 10;
    if (meters < 1000) return `${Math.max(meters, 10)} m`;
    return `${km.toLocaleString('es-CO', { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;
}

/** Abre la ruta en Google Maps hacia el punto exacto o, si no lo hay, hacia la dirección escrita. */
export const directionsUrl = (destination: MapPoint | string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`)}`;
