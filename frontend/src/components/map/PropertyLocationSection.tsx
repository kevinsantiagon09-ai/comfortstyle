import { lazy, Suspense } from 'react';
import { MapPin } from 'lucide-react';
import type { Property } from '../../types/property';
import { toMapPoint } from '../../utils/map';

const PropertyMap = lazy(() => import('./PropertyMap'));

/** Ubicación en el detalle público; solo aparece si el anfitrión marcó el punto en el mapa. La librería del mapa se carga al llegar aquí. */
export default function PropertyLocationSection({ property }: { property: Property }) {
    const point = toMapPoint(property.latitude ?? '', property.longitude ?? '');
    if (!point) return null;

    return <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Dónde vas a estar</h2>
        <p className="flex items-center gap-2 text-sm text-slate-600"><MapPin aria-hidden="true" className="size-4 text-blue-700" />{property.address}, {property.city}, {property.department}</p>
        <Suspense fallback={<div role="status" className="grid h-72 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">Cargando mapa…</div>}>
            <PropertyMap point={point} name={property.name} />
        </Suspense>
    </section>;
}
