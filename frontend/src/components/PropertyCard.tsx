import { fallbackImage, propertyImageUrl } from '../utils/imageUrl';
import type { Property } from '../types/property';

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({
    property,
}: PropertyCardProps) {
    const coverImage =
        property.images?.find((image) => image.is_cover) ??
        property.images?.[0];

    const imageUrl = propertyImageUrl(coverImage?.image_path);

    return (
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <img
                key={imageUrl}
                src={imageUrl}
                loading="lazy"
                onError={(event) => {
                    if (event.currentTarget.getAttribute('src') !== fallbackImage) {
                        event.currentTarget.src = fallbackImage;
                    }
                }}
                alt={coverImage?.caption ?? property.name}
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
                        ${Number(property.price).toLocaleString('es-CO')}
                    </strong>{' '}
                    {property.currency} por noche
                </p>
            </div>
        </article>
    );
}