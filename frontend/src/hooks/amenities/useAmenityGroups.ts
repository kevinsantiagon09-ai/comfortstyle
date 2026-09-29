import { useMemo } from 'react';
import { groupByCategory } from '../../utils/amenities';
import { useAmenities } from './useAmenities';

/** Catálogo de comodidades agrupado por categoría. */
export function useAmenityGroups() {
    const amenities = useAmenities();
    const groups = useMemo(() => groupByCategory(amenities.data ?? []), [amenities.data]);

    return { amenities, groups };
}
