import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_ATTRIBUTION, MAP_TILES_URL, POINT_MAP_ZOOM } from '../../constants/map';
import type { LocationPickerMapProps } from '../../types/map';
import { pinIcon } from '../../utils/map';

function ClickToPick({ onPick, disabled }: Pick<LocationPickerMapProps, 'onPick' | 'disabled'>) {
    useMapEvents({ click: (event) => { if (!disabled) onPick({ lat: event.latlng.lat, lng: event.latlng.lng }); } });
    return null;
}

/** Acerca el mapa cuando el punto cambia desde fuera del mapa (por ejemplo, «Usar mi ubicación»). */
function Follow({ point }: Pick<LocationPickerMapProps, 'point'>) {
    const map = useMap();
    useEffect(() => {
        if (point) map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), POINT_MAP_ZOOM), { duration: 0.6 });
    }, [map, point]);
    return null;
}

/** Mapa para elegir la ubicación: clic para poner el pin y arrastrarlo para afinarlo. */
export default function LocationPickerMap({ point, onPick, disabled }: LocationPickerMapProps) {
    return <MapContainer
        center={point ? [point.lat, point.lng] : DEFAULT_MAP_CENTER}
        zoom={point ? POINT_MAP_ZOOM : DEFAULT_MAP_ZOOM}
        scrollWheelZoom={false}
        className="h-64 w-full rounded-xl"
        aria-label="Mapa para elegir la ubicación"
    >
        <TileLayer url={MAP_TILES_URL} attribution={MAP_ATTRIBUTION} />
        <ClickToPick onPick={onPick} disabled={disabled} />
        <Follow point={point} />
        {point && <Marker
            position={[point.lat, point.lng]}
            icon={pinIcon}
            draggable={!disabled}
            eventHandlers={{ dragend: (event) => { const { lat, lng } = event.target.getLatLng(); onPick({ lat, lng }); } }}
        />}
    </MapContainer>;
}
