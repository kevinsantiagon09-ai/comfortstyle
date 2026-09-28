import type { Amenity } from '../../../types/property';
import { useAmenities } from '../hooks/useAmenities';
import { AmenityIcon } from '../utils/amenityIcons';

interface Props {
    selected: number[];
    onToggle: (id: number) => void;
    disabled?: boolean;
    error?: string;
}

/** Agrupa el catálogo por categoría conservando el orden en que lo entrega el backend. */
function byCategory(amenities: Amenity[]) {
    const groups = new Map<string, Amenity[]>();
    for (const amenity of amenities) {
        const category = amenity.category ?? 'Otras';
        groups.set(category, [...(groups.get(category) ?? []), amenity]);
    }
    return [...groups];
}

export default function PropertyAmenitiesPicker({ selected, onToggle, disabled, error }: Props) {
    const amenities = useAmenities();

    if (amenities.isPending) return <p role="status">Cargando comodidades…</p>;
    if (amenities.isError) return <p role="alert">No pudimos cargar las comodidades. <button type="button" onClick={() => void amenities.refetch()} className="text-blue-700 underline">Reintentar</button></p>;
    if (amenities.data.length === 0) return <p role="status">Todavía no hay comodidades disponibles. Puedes continuar sin elegir ninguna.</p>;

    return <div className="space-y-6">
        <p className="text-sm text-slate-600">Marca lo que ofrece tu alojamiento. Es opcional y puedes elegir varias. <span className="font-medium text-slate-800">{selected.length} seleccionada{selected.length === 1 ? '' : 's'}.</span></p>
        {byCategory(amenities.data).map(([category, items]) => <fieldset key={category}>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((amenity) => {
                    const checked = selected.includes(amenity.id);
                    return <label key={amenity.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${checked ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 hover:border-blue-300'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
                        <input type="checkbox" className="h-4 w-4 accent-blue-700" checked={checked} disabled={disabled} onChange={() => onToggle(amenity.id)} />
                        <AmenityIcon icon={amenity.icon} className={`h-5 w-5 shrink-0 ${checked ? 'text-blue-700' : 'text-slate-500'}`} />
                        <span>{amenity.name}</span>
                    </label>;
                })}
            </div>
        </fieldset>)}
        {error && <span role="alert" className="block text-sm text-red-700">{error}</span>}
    </div>;
}
