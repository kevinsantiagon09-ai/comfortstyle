import { useState } from 'react';
import type { LocationMapFieldProps, MapPoint } from '../../types/map';
import { formatCoordinate, toMapPoint } from '../../utils/map';

/** Punto elegido en el formulario y su obtención desde el GPS del navegador. */
export function useMapLocation({ latitude, longitude, onChange }: Omit<LocationMapFieldProps, 'error'>) {
    const [locating, setLocating] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const point = toMapPoint(latitude, longitude);

    const pick = ({ lat, lng }: MapPoint) => {
        setGeoError(null);
        onChange(formatCoordinate(lat), formatCoordinate(lng));
    };

    const locate = () => {
        if (!navigator.geolocation) return setGeoError('Tu navegador no permite obtener la ubicación.');
        setLocating(true);
        setGeoError(null);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => { setLocating(false); pick({ lat: coords.latitude, lng: coords.longitude }); },
            () => { setLocating(false); setGeoError('No pudimos obtener tu ubicación. Revisa el permiso o marca el punto en el mapa.'); },
            { enableHighAccuracy: true, timeout: 10_000 },
        );
    };

    return { point, pick, locate, clear: () => onChange('', ''), locating, geoError };
}
