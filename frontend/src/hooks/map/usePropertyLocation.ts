import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NEARBY_LIMIT } from '../../constants/map';
import { propertyDetailPath } from '../../routes/paths';
import type { MapStyle, MapViewCommand, NearbyProperty } from '../../types/map';
import type { Property } from '../../types/property';
import { directionsUrl, distanceKm, toMapPoint } from '../../utils/map';
import { toTitleCase } from '../../utils/property';
import { useGeocodedPlace } from './useGeocodedPlace';
import { useMapProperties } from './useMapProperties';

/**
 * Explorador del entorno del detalle: usa el punto que marcó el anfitrión o, si no lo hay, el centro de su ciudad,
 * y le pone alrededor los demás alojamientos publicados, del más cercano al más lejano.
 */
export function usePropertyLocation(property: Property) {
    const navigate = useNavigate();
    const exact = useMemo(() => toMapPoint(property.latitude ?? '', property.longitude ?? ''), [property.latitude, property.longitude]);
    const place = toTitleCase([property.city, property.department].filter(Boolean).join(', '));
    const geocoded = useGeocodedPlace(`${place}, Colombia`, !exact && place !== '');
    const mapProperties = useMapProperties();
    const center = exact ?? geocoded.data ?? null;

    const [activeUuid, setActiveUuid] = useState<string | null>(null);
    const [mapStyle, setMapStyle] = useState<MapStyle>('mapa');
    const [expanded, setExpanded] = useState(false);
    const [view, setView] = useState<MapViewCommand>({ kind: 'home', id: 0 });

    const nearby = useMemo<NearbyProperty[]>(() => {
        if (!center) return [];
        return (mapProperties.data ?? [])
            .filter((item) => item.uuid !== property.uuid)
            .flatMap((item) => {
                const point = toMapPoint(item.latitude, item.longitude);
                return point ? [{ ...item, city: item.city && toTitleCase(item.city), point, distanceKm: distanceKm(center, point) }] : [];
            })
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, NEARBY_LIMIT);
    }, [center, mapProperties.data, property.uuid]);

    return {
        center,
        approximate: !exact,
        loading: !exact && place !== '' && geocoded.isPending,
        place,
        nearby,
        directions: directionsUrl(exact ?? `${property.address}, ${place}, Colombia`),
        activeUuid,
        setActiveUuid,
        open: (uuid: string) => navigate(propertyDetailPath(uuid)),
        mapStyle,
        setMapStyle,
        expanded,
        toggleExpanded: () => setExpanded((value) => !value),
        view,
        goHome: () => setView(({ id }) => ({ kind: 'home', id: id + 1 })),
        showAll: nearby.length > 0 ? () => setView(({ id }) => ({ kind: 'all', id: id + 1 })) : null,
    };
}
