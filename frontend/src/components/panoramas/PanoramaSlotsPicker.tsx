import { Rotate3d } from 'lucide-react';
import { PANORAMA_SLOTS } from '../../constants/panoramas';
import type { PanoramaSlotsPickerProps } from '../../types/panorama';
import PanoramaSlotCard from './PanoramaSlotCard';

/** Recorrido 360° opcional al registrar: un contenedor por espacio, al 80% del ancho. */
export default function PanoramaSlotsPicker({ drafts, errors = {}, onChange, disabled }: PanoramaSlotsPickerProps) {
    const added = Object.keys(drafts).length;
    const titleOf = (key: string) => PANORAMA_SLOTS.find((slot) => slot.key === key)?.title ?? key;
    /** Mueve la miniatura a otro espacio; si ese ya tenía una, se intercambian. Cada foto toma el nombre de su nuevo espacio. */
    const move = (from: string, to: string) => {
        const { [from]: moved, [to]: displaced, ...rest } = drafts;
        if (!moved) return;
        const next = {
            ...rest,
            [to]: { ...moved, title: titleOf(to) },
            ...(displaced ? { [from]: { ...displaced, title: titleOf(from) } } : {}),
        };
        onChange(next, to);
        if (displaced) onChange(next, from);
    };

    return <section aria-labelledby="pano-title" className="space-y-3 border-t border-slate-100 pt-5">
        <header className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <h3 id="pano-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <Rotate3d aria-hidden="true" className="h-5 w-5 text-blue-700" />Recorrido virtual 360°
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">Opcional</span>
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Sube cualquier foto JPG, PNG o WEBP (hasta 100 MB): si no es 360° real, la convertimos automáticamente. Arrastra una miniatura a otro espacio para moverla o intercambiarla.</p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{added}/{PANORAMA_SLOTS.length}</span>
        </header>
        <ul className="mx-auto grid w-4/5 grid-cols-2 gap-3 sm:grid-cols-3">
            {PANORAMA_SLOTS.map((slot) => <PanoramaSlotCard
                key={slot.key}
                slot={slot}
                draft={drafts[slot.key]}
                error={errors[slot.key]}
                disabled={disabled}
                onPick={(upload) => onChange({ ...drafts, [slot.key]: upload }, slot.key)}
                onMove={(from) => move(from, slot.key)}
                onClear={() => onChange(Object.fromEntries(Object.entries(drafts).filter(([key]) => key !== slot.key)), slot.key)}
            />)}
        </ul>
    </section>;
}
