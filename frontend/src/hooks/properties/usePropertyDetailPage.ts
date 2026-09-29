import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { groupByCategory } from '../../utils/amenities';
import { toPositiveId } from '../../utils/routeParams';
import { usePublicProperty } from './usePublicProperty';

export function usePropertyDetailPage() {
    const id = toPositiveId(useParams().id);
    const query = usePublicProperty(id ?? 0);
    const property = query.data;

    const amenityGroups = useMemo(() => groupByCategory(property?.amenities ?? []), [property?.amenities]);

    return {
        valid: id !== null,
        property,
        amenityGroups,
        loading: query.isPending && id !== null,
        error: query.isError ? 'No fue posible cargar el alojamiento.' : null,
        formattedPrice: property ? Number(property.price).toLocaleString('es-CO') : '',
    };
}
