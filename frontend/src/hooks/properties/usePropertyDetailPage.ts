import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { groupByCategory } from '../../utils/amenities';
import { toTitleCase } from '../../utils/property';
import { toUuid } from '../../utils/routeParams';
import { useVirtualTour } from '../propertyPanoramas/useVirtualTour';
import { usePublicProperty } from './usePublicProperty';

/** Id del bloque de reserva, destino del botón «Reservar este lugar» del recorrido. */
const RESERVATION_ID = 'reservar';

export function usePropertyDetailPage() {
    const uuid = toUuid(useParams().uuid);
    const query = usePublicProperty(uuid ?? '');
    const property = query.data;
    const [copied, setCopied] = useState(false);
    const tour = useVirtualTour(property?.panoramas, RESERVATION_ID);

    const amenityGroups = useMemo(() => groupByCategory(property?.amenities ?? []), [property?.amenities]);

    /** En móvil abre el menú nativo de compartir; en escritorio copia el enlace. */
    async function share() {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: property?.name, url }).catch(() => undefined);
            return;
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return {
        valid: uuid !== null,
        property,
        amenityGroups,
        loading: query.isPending && uuid !== null,
        error: query.isError ? 'No fue posible cargar el alojamiento.' : null,
        formattedPrice: property ? Number(property.price).toLocaleString('es-CO') : '',
        location: property ? toTitleCase(`${property.city}, ${property.department}`) : '',
        copied,
        share,
        tour,
        reservationId: RESERVATION_ID,
    };
}
