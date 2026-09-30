import type { Amenity, AmenityGroup } from './amenity';
import type { PropertyPanorama } from './panorama';

export interface PropertyImage {
    id: number;
    uuid: string;
    property_id: number;
    image_path: string;
    caption: string | null;
    is_cover: boolean;
    display_order: number;
    is_active: boolean;
}

export interface PropertyHost {
    id: number;
    uuid: string;
    name: string;
    email?: string;
}

export interface Property {
    id: number;
    uuid: string;
    user_id: number;
    city_id: number;
    name: string;
    description: string;
    property_type: string;
    address: string;
    latitude: string | null;
    longitude: string | null;
    department: string;
    department_id: number | null;
    city: string;
    max_guests: number;
    bathrooms: number;
    bedrooms: number;
    beds: number;
    price: string;
    currency: string;
    check_in_time: string | null;
    check_out_time: string | null;
    is_active: boolean;
    host?: PropertyHost;
    images: PropertyImage[];
    amenities?: Amenity[];
    panoramas?: PropertyPanorama[];
}

/** Valores tal como los escribe el anfitrión; el backend los valida y convierte. */
export interface PropertyInput {
    name: string;
    description: string;
    property_type: string;
    address: string;
    latitude: string | null;
    longitude: string | null;
    city_id: string;
    max_guests: string;
    bathrooms: string;
    bedrooms: string;
    beds: string;
    price: string;
    currency: string;
    check_in_time: string | null;
    check_out_time: string | null;
    amenities: number[];
}

// Props de componentes
export interface PropertyCardProps {
    property: Property;
}

export interface PropertyFeaturesProps {
    property: Property;
}

export interface PropertyAmenitiesListProps {
    groups: AmenityGroup[];
}

export interface PropertyGalleryProps {
    images: PropertyImage[];
    name: string;
}

export interface PropertyHeaderProps {
    name: string;
    location: string;
    copied: boolean;
    onShare: () => void;
}

