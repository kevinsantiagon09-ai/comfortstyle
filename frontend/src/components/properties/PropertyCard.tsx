import { Link } from 'react-router-dom';
import { usePropertyCard } from '../../hooks/properties/usePropertyCard';
import { propertyDetailPath } from '../../routes/paths';
import type { PropertyCardProps } from '../../types/property';

export default function PropertyCard({
    property,
}: PropertyCardProps) {
    const { imageUrl, imageAlt, formattedPrice, handleImageError } = usePropertyCard(property);

    return (
        <Link
            to={propertyDetailPath(property.uuid)}
            className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
            <img
                key={imageUrl}
                src={imageUrl}
                loading="lazy"
                onError={handleImageError}
                alt={imageAlt}
                className="h-56 w-full object-cover"
            />

            <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="font-semibold text-slate-900">
                        {property.name}
                    </h2>

                    <span className="whitespace-nowrap text-sm">
                        ★ Nuevo
                    </span>
                </div>

                <p className="text-sm text-slate-500">
                    {property.city}, {property.department}
                </p>

                <p className="line-clamp-2 text-sm text-slate-600">
                    {property.description}
                </p>

                <p className="pt-2 text-slate-900">
                    <strong>
                        ${formattedPrice}
                    </strong>{' '}
                    {property.currency} por noche
                </p>
            </div>
        </Link>
    );
}
