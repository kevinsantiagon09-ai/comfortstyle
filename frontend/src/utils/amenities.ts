import type { Amenity, AmenityGroup } from '../types/amenity';

/** Agrupa el catálogo por categoría conservando el orden en que lo entrega el backend. */
export function groupByCategory(amenities: Amenity[]): AmenityGroup[] {
    const groups = new Map<string, Amenity[]>();
    for (const amenity of amenities) {
        const category = amenity.category ?? 'Otras';
        groups.set(category, [...(groups.get(category) ?? []), amenity]);
    }
    return [...groups];
}
