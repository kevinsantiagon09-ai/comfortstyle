import AmenityIcon from './AmenityIcon';
import type { PropertyAmenitiesListProps } from '../../types/property';

/** Comodidades compactas: una fila por categoría, con el nombre a la izquierda y las comodidades como chips. */
export default function PropertyAmenitiesList({ groups }: PropertyAmenitiesListProps) {
    if (groups.length === 0) return null;

    return (
        <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Lo que ofrece este lugar</h2>

            <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {groups.map(([category, amenities]) => (
                    <div key={category} className="grid gap-2 px-4 py-3 sm:grid-cols-[7rem_1fr] sm:items-center">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{category}</dt>
                        <dd>
                            <ul className="flex flex-wrap gap-1.5">
                                {amenities.map((amenity) => (
                                    <li key={amenity.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200">
                                        <AmenityIcon icon={amenity.icon} className="size-4 shrink-0 text-blue-700" />
                                        {amenity.name}
                                    </li>
                                ))}
                            </ul>
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
