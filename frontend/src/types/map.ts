import type { Property } from './property';

export interface MapPoint {
    lat: number;
    lng: number;
}

export interface LocationPickerMapProps {
    point: MapPoint | null;
    onPick: (point: MapPoint) => void;
    disabled?: boolean;
}

export interface LocationMapFieldProps {
    latitude: string;
    longitude: string;
    onChange: (latitude: string, longitude: string) => void;
    error?: string;
}

/** Alojamiento publicado tal como lo devuelve /public/properties/map. */
export interface MapProperty {
    uuid: string;
    name: string;
    property_type: string;
    price: string;
    currency: string;
    latitude: string;
    longitude: string;
    city: string | null;
    department: string | null;
    cover_path: string | null;
}

/** Alojamiento del mapa con su punto y la distancia al que se está viendo. */
export interface NearbyProperty extends MapProperty {
    point: MapPoint;
    distanceKm: number;
}

export type MapStyle = 'mapa' | 'satelite';

/** Orden para mover la cámara: volver a la casa o encuadrar todo. `id` cambia en cada clic para repetirla. */
export interface MapViewCommand {
    kind: 'home' | 'all';
    id: number;
}

export interface ExploreMapProps {
    center: MapPoint;
    approximate: boolean;
    name: string;
    nearby: NearbyProperty[];
    activeUuid: string | null;
    onActivate: (uuid: string | null) => void;
    onOpen: (uuid: string) => void;
    mapStyle: MapStyle;
    view: MapViewCommand;
    expanded: boolean;
}

export interface NearbyPropertyListProps {
    items: NearbyProperty[];
    activeUuid: string | null;
    onActivate: (uuid: string | null) => void;
}

export interface MapToolbarProps {
    mapStyle: MapStyle;
    onStyle: (style: MapStyle) => void;
    expanded: boolean;
    onToggleExpanded: () => void;
    onHome: () => void;
    onShowAll: (() => void) | null;
}

export interface PropertyLocationSectionProps {
    property: Property;
}
