import { LocateFixed, Map as MapIcon, Maximize2, Minimize2, Satellite, ScanSearch } from 'lucide-react';
import type { MapStyle, MapToolbarProps } from '../../types/map';

const STYLES: { value: MapStyle; label: string; icon: typeof MapIcon }[] = [
    { value: 'mapa', label: 'Mapa', icon: MapIcon },
    { value: 'satelite', label: 'Satélite', icon: Satellite },
];

const BUTTON = 'grid size-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md backdrop-blur hover:bg-white hover:text-blue-700';

/** Controles flotantes del explorador: capa, volver a la casa, ver cercanos y ampliar. */
export default function MapToolbar({ mapStyle, onStyle, expanded, onToggleExpanded, onHome, onShowAll }: MapToolbarProps) {
    return <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
        <div role="radiogroup" aria-label="Tipo de mapa" className="flex rounded-full bg-white/95 p-1 shadow-md backdrop-blur">
            {STYLES.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={mapStyle === value}
                    onClick={() => onStyle(value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${mapStyle === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    <Icon aria-hidden="true" className="size-3.5" />{label}
                </button>
            ))}
        </div>
        <button type="button" onClick={onToggleExpanded} aria-label={expanded ? 'Reducir mapa' : 'Ampliar mapa'} title={expanded ? 'Reducir mapa' : 'Ampliar mapa'} className={BUTTON}>
            {expanded ? <Minimize2 aria-hidden="true" className="size-4" /> : <Maximize2 aria-hidden="true" className="size-4" />}
        </button>
        <button type="button" onClick={onHome} aria-label="Volver al alojamiento" title="Volver al alojamiento" className={BUTTON}>
            <LocateFixed aria-hidden="true" className="size-4" />
        </button>
        {onShowAll && <button type="button" onClick={onShowAll} aria-label="Ver alojamientos cercanos" title="Ver alojamientos cercanos" className={BUTTON}>
            <ScanSearch aria-hidden="true" className="size-4" />
        </button>}
    </div>;
}
