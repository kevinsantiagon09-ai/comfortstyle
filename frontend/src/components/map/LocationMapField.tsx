import { lazy, Suspense } from 'react';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { useMapLocation } from '../../hooks/map/useMapLocation';
import type { LocationMapFieldProps } from '../../types/map';

const LocationPickerMap = lazy(() => import('./LocationPickerMap'));

/** Ubicación exacta del alojamiento (opcional): se marca en el mapa y se le muestra al huésped. */
export default function LocationMapField(props: LocationMapFieldProps) {
    const { point, pick, locate, clear, locating, geoError } = useMapLocation(props);
    const error = props.error ?? geoError;

    return <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <MapPin aria-hidden="true" className="h-4 w-4 text-blue-700" />Ubicación en el mapa
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Opcional</span>
            </p>
            <div className="flex gap-1.5">
                <button type="button" onClick={locate} disabled={locating} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <LocateFixed aria-hidden="true" className="h-3.5 w-3.5" />{locating ? 'Buscando…' : 'Usar mi ubicación'}
                </button>
                {point && <button type="button" onClick={clear} aria-label="Quitar ubicación" className="inline-flex items-center rounded-lg border border-slate-300 px-2 py-1.5 text-slate-600 hover:bg-slate-50"><X aria-hidden="true" className="h-3.5 w-3.5" /></button>}
            </div>
        </div>
        <div className={`overflow-hidden rounded-xl border ${props.error ? 'border-red-500' : 'border-slate-200'}`}>
            <Suspense fallback={<div role="status" className="grid h-64 place-items-center bg-slate-100 text-sm text-slate-500">Cargando mapa…</div>}>
                <LocationPickerMap point={point} onPick={pick} />
            </Suspense>
        </div>
        <p className="text-xs text-slate-500">
            {point ? `Lat ${props.latitude} · Lng ${props.longitude} — arrastra el pin para afinarlo.` : 'Haz clic en el mapa para marcar dónde está tu alojamiento, o usa tu ubicación actual.'}
        </p>
        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>;
}
