import { lazy, Suspense } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { usePropertyLocation } from '../../hooks/map/usePropertyLocation';
import type { PropertyLocationSectionProps } from '../../types/map';
import MapToolbar from './MapToolbar';
import NearbyPropertyList from './NearbyPropertyList';

const ExploreMap = lazy(() => import('./ExploreMap'));

const MAP_SKELETON = <div role="status" className="grid h-full place-items-center bg-slate-100 text-sm text-slate-500">Cargando mapa…</div>;

/** «Explora el entorno»: dónde queda el alojamiento y qué otros hay cerca. La librería del mapa se carga al llegar aquí. */
export default function PropertyLocationSection({ property }: PropertyLocationSectionProps) {
    const location = usePropertyLocation(property);
    if (!location.center && !location.loading) return null;

    return <section aria-labelledby="explore-title" className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h2 id="explore-title" className="text-xl font-semibold text-slate-900">Explora el entorno</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><MapPin aria-hidden="true" className="size-4 text-blue-700" />{location.place}</p>
            </div>
            <a href={location.directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-blue-600 hover:text-blue-700">
                <Navigation aria-hidden="true" className="size-4" />Cómo llegar
            </a>
        </header>

        <div role="region" aria-label={`Mapa del entorno de ${property.name}`} className={`relative isolate overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-[height] duration-300 ${location.expanded ? 'h-[75vh]' : 'h-[420px]'}`}>
            {location.center ? <>
                <Suspense fallback={MAP_SKELETON}>
                    <ExploreMap
                        center={location.center}
                        approximate={location.approximate}
                        name={property.name}
                        nearby={location.nearby}
                        activeUuid={location.activeUuid}
                        onActivate={location.setActiveUuid}
                        onOpen={location.open}
                        mapStyle={location.mapStyle}
                        view={location.view}
                        expanded={location.expanded}
                    />
                </Suspense>
                <div className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[60%] rounded-2xl bg-white/90 px-4 py-3 shadow-md backdrop-blur">
                    <p className="truncate text-sm font-semibold text-slate-900">{property.name}</p>
                    <p className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${location.approximate ? 'text-amber-700' : 'text-emerald-700'}`}>
                        <span className={`size-2 rounded-full ${location.approximate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {location.approximate ? 'Zona aproximada' : 'Ubicación exacta'}
                    </p>
                </div>
                <MapToolbar
                    mapStyle={location.mapStyle}
                    onStyle={location.setMapStyle}
                    expanded={location.expanded}
                    onToggleExpanded={location.toggleExpanded}
                    onHome={location.goHome}
                    onShowAll={location.showAll}
                />
            </> : MAP_SKELETON}
        </div>

        <p className="text-sm text-slate-500">
            {location.approximate
                ? `El anfitrión aún no ha marcado el punto exacto: te mostramos la zona de ${location.place}.`
                : 'Ubicación marcada por el anfitrión. Pasa el cursor por un precio para ver ese alojamiento y su distancia.'}
        </p>

        {location.nearby.length > 0 && <NearbyPropertyList items={location.nearby} activeUuid={location.activeUuid} onActivate={location.setActiveUuid} />}
    </section>;
}
