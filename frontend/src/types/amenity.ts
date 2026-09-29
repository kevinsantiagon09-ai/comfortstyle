export interface Amenity {
    id: number;
    name: string;
    category: string | null;
    description?: string | null;
    icon: string | null;
}

/** Categoría y sus comodidades, en el orden en que las entrega el backend. */
export type AmenityGroup = [category: string, amenities: Amenity[]];

// Props de componentes
export interface AmenitiesPickerProps {
    selected: number[];
    onToggle: (id: number) => void;
    disabled?: boolean;
    error?: string;
}
