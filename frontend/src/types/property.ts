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
    email: string;
}

export interface Property {
    id: number;
    uuid: string;
    user_id: number;
    name: string;
    description: string;
    property_type: string;
    address: string;
    department: string;
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
}