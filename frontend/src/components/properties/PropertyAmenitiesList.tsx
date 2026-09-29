import AmenityIcon from './AmenityIcon';
import type { PropertyAmenitiesListProps } from '../../types/property';

export default function PropertyAmenitiesList({ groups }: PropertyAmenitiesListProps) {
    if (groups.length === 0) return null;

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Lo que ofrece este lugar</h2>

            {groups.map(([category, amenities]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">{category}</h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {amenities.map((amenity) => (
                            <li key={amenity.id} className="flex items-center gap-3 text-slate-700">
                                <AmenityIcon icon={amenity.icon} className="size-5" />
                                {amenity.name}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>
    );
}
