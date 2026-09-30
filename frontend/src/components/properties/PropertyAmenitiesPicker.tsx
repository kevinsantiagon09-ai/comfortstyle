import { useAmenityGroups } from '../../hooks/amenities/useAmenityGroups';
import type { AmenitiesPickerProps } from '../../types/amenity';
import AmenityIcon from './AmenityIcon';

export default function PropertyAmenitiesPicker({ selected, onToggle, disabled, error }: AmenitiesPickerProps) {
    const { amenities, groups } = useAmenityGroups();

    if (amenities.isPending) return <p role="status">Cargando comodidades…</p>;
    if (amenities.isError) return <p role="alert">No pudimos cargar las comodidades. <button type="button" onClick={() => void amenities.refetch()} className="text-blue-700 underline">Reintentar</button></p>;
    if (amenities.data.length === 0) return <p role="status">Todavía no hay comodidades disponibles. Puedes continuar sin elegir ninguna.</p>;

    return <div className="space-y-4">
        <p className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>Marca lo que ofrece tu alojamiento. Es opcional.</span>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{selected.length} seleccionada{selected.length === 1 ? '' : 's'}</span>
        </p>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {groups.map(([category, items]) => <fieldset key={category} className="px-4 py-3">
                <legend className="float-left mb-2 w-full text-[11px] font-semibold uppercase tracking-wider text-slate-500">{category}</legend>
                <div className="flex clear-both flex-wrap gap-1.5">
                    {items.map((amenity) => {
                        const checked = selected.includes(amenity.id);
                        return <label key={amenity.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition focus-within:ring-2 focus-within:ring-blue-300 ${checked ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700 hover:border-blue-300'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
                            <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={() => onToggle(amenity.id)} />
                            <AmenityIcon icon={amenity.icon} className={`h-4 w-4 shrink-0 ${checked ? 'text-blue-700' : 'text-slate-500'}`} />
                            {amenity.name}
                        </label>;
                    })}
                </div>
            </fieldset>)}
        </div>
        {error && <span role="alert" className="block text-sm text-red-700">{error}</span>}
    </div>;
}
