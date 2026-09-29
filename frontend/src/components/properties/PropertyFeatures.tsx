import { Bath, BedDouble, Clock, DoorOpen, Users } from 'lucide-react';
import type { PropertyFeaturesProps } from '../../types/property';

export default function PropertyFeatures({ property }: PropertyFeaturesProps) {
    const items = [
        { icon: Users, label: `${property.max_guests} huéspedes` },
        { icon: DoorOpen, label: `${property.bedrooms} habitaciones` },
        { icon: BedDouble, label: `${property.beds} camas` },
        { icon: Bath, label: `${property.bathrooms} baños` },
    ];

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Características</h2>
            <p className="text-sm text-slate-500">{property.property_type}</p>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                        <Icon className="size-5 text-slate-600" aria-hidden="true" />
                        {label}
                    </li>
                ))}
            </ul>

            {(property.check_in_time || property.check_out_time) && (
                <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="size-4" aria-hidden="true" />
                    Llegada {property.check_in_time?.slice(0, 5) ?? '—'} · Salida {property.check_out_time?.slice(0, 5) ?? '—'}
                </p>
            )}
        </section>
    );
}
