export interface MapPoint {
    lat: number;
    lng: number;
}

export interface LocationPickerMapProps {
    point: MapPoint | null;
    onPick: (point: MapPoint) => void;
    disabled?: boolean;
}

export interface PropertyMapProps {
    point: MapPoint;
    name: string;
}

export interface LocationMapFieldProps {
    latitude: string;
    longitude: string;
    onChange: (latitude: string, longitude: string) => void;
    error?: string;
}
