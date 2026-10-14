import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { APPROXIMATE_RADIUS_M, APPROXIMATE_ZOOM, ARRIVAL_DURATION_S, ARRIVAL_ZOOM, EXACT_ZOOM, MAP_STYLES } from '../../constants/map';
import type { ExploreMapProps } from '../../types/map';
import { propertyImageUrl } from '../../utils/imageUrl';
import { formatDistance, homeIcon, priceIcon } from '../../utils/map';

/** Resalta la etiqueta del alojamiento activo sin reemplazar su icono. */
function ActivePrice({ activeUuid }: Pick<ExploreMapProps, 'activeUuid'>) {
    const map = useMap();
    useEffect(() => {
        map.getContainer().querySelectorAll<HTMLElement>('.map-price').forEach((label) => {
            label.classList.toggle('is-active', label.dataset.uuid === activeUuid);
        });
    }, [map, activeUuid]);
    return null;
}

type CameraProps = Pick<ExploreMapProps, 'center' | 'approximate' | 'nearby' | 'view' | 'expanded'>;

/**
 * Mueve la cámara: «aterriza» sobre la casa la primera vez que el mapa entra en pantalla,
 * obedece a «volver a la casa» / «ver cercanos» y se reajusta al ampliar el mapa.
 */
function MapCamera({ center, approximate, nearby, view, expanded }: CameraProps) {
    const map = useMap();
    const arrived = useRef(false);
    const lastView = useRef(view.id);
    const zoom = approximate ? APPROXIMATE_ZOOM : EXACT_ZOOM;

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            arrived.current = true;
            map.setView([center.lat, center.lng], zoom);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || arrived.current) return;
            arrived.current = true;
            map.flyTo([center.lat, center.lng], zoom, { duration: ARRIVAL_DURATION_S });
            observer.disconnect();
        }, { threshold: 0.5 });
        observer.observe(map.getContainer());
        return () => observer.disconnect();
    }, [map, center, zoom]);

    useEffect(() => {
        if (view.id === lastView.current) return;
        lastView.current = view.id;
        if (view.kind === 'all' && nearby.length > 0) {
            const bounds = L.latLngBounds([[center.lat, center.lng], ...nearby.map(({ point }) => [point.lat, point.lng] as [number, number])]);
            map.flyToBounds(bounds, { padding: [70, 70], maxZoom: zoom, duration: 1.2 });
        } else {
            map.flyTo([center.lat, center.lng], zoom, { duration: 1.2 });
        }
    }, [map, view, center, nearby, zoom]);

    useEffect(() => {
        if (expanded) map.scrollWheelZoom.enable();
        else map.scrollWheelZoom.disable();
        const timer = setTimeout(() => map.invalidateSize(), 320);
        return () => clearTimeout(timer);
    }, [map, expanded]);

    return null;
}

/** Mapa del detalle: la casa con ondas de radar y, alrededor, los demás alojamientos publicados con su precio. */
export default function ExploreMap({ center, approximate, name, nearby, activeUuid, onActivate, onOpen, mapStyle, view, expanded }: ExploreMapProps) {
    const tiles = MAP_STYLES[mapStyle];
    const active = nearby.find((item) => item.uuid === activeUuid);

    return <MapContainer center={[center.lat, center.lng]} zoom={ARRIVAL_ZOOM} zoomControl={false} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer key={mapStyle} url={tiles.url} attribution={tiles.attribution} zIndex={1} />
        {tiles.labelsUrl && <TileLayer url={tiles.labelsUrl} zIndex={2} />}
        <ZoomControl position="bottomright" />
        <ActivePrice activeUuid={activeUuid} />
        <MapCamera center={center} approximate={approximate} nearby={nearby} view={view} expanded={expanded} />

        {approximate && <Circle center={[center.lat, center.lng]} radius={APPROXIMATE_RADIUS_M} pathOptions={{ color: '#1d4ed8', weight: 2, dashArray: '6 8', fillColor: '#3b82f6', fillOpacity: 0.12 }} />}

        {active && <Polyline
            positions={[[center.lat, center.lng], [active.point.lat, active.point.lng]]}
            pathOptions={{ color: '#1d4ed8', weight: 3, dashArray: '2 10', lineCap: 'round', className: 'map-route' }}
        />}

        <Marker position={[center.lat, center.lng]} icon={homeIcon} zIndexOffset={2000} title={name} keyboard={false} />

        {nearby.map((item) => (
            <Marker
                key={item.uuid}
                position={[item.point.lat, item.point.lng]}
                icon={priceIcon(item.uuid, item.price)}
                zIndexOffset={item.uuid === activeUuid ? 1000 : 0}
                title={`${item.name}, a ${formatDistance(item.distanceKm)}`}
                eventHandlers={{
                    click: () => onOpen(item.uuid),
                    mouseover: () => onActivate(item.uuid),
                    mouseout: () => onActivate(null),
                }}
            >
                <Tooltip direction="top" offset={[0, -16]} opacity={1} className="map-card">
                    <img src={propertyImageUrl(item.cover_path)} alt="" className="h-24 w-48 object-cover" />
                    <span className="block w-48 px-3 py-2">
                        <span className="block truncate text-xs font-semibold text-slate-900">{item.name}</span>
                        <span className="block text-[11px] text-slate-500">{item.city} · a {formatDistance(item.distanceKm)}</span>
                    </span>
                </Tooltip>
            </Marker>
        ))}
    </MapContainer>;
}
