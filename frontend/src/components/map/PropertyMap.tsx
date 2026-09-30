import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_ATTRIBUTION, MAP_TILES_URL, POINT_MAP_ZOOM } from '../../constants/map';
import type { PropertyMapProps } from '../../types/map';
import { pinIcon } from '../../utils/map';

/** Mapa de solo lectura para el huésped: la rueda solo acerca con Ctrl para no estorbar al desplazarse por la página. */
export default function PropertyMap({ point, name }: PropertyMapProps) {
    return <MapContainer center={[point.lat, point.lng]} zoom={POINT_MAP_ZOOM - 2} scrollWheelZoom={false} className="h-72 w-full rounded-xl" aria-label={`Ubicación de ${name}`}>
        <TileLayer url={MAP_TILES_URL} attribution={MAP_ATTRIBUTION} />
        <Marker position={[point.lat, point.lng]} icon={pinIcon} title={name} />
    </MapContainer>;
}
