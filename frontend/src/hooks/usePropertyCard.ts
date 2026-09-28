import type { SyntheticEvent } from 'react';
import type { Property } from '../types/property';
import { fallbackImage, propertyImageUrl } from '../utils/imageUrl';

export function usePropertyCard(property: Property) {
    const coverImage = property.images?.find((image) => image.is_cover)
        ?? property.images?.[0];
    const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
        if (event.currentTarget.getAttribute('src') !== fallbackImage) {
            event.currentTarget.src = fallbackImage;
        }
    };

    return {
        imageUrl: propertyImageUrl(coverImage?.image_path),
        imageAlt: coverImage?.caption ?? property.name,
        formattedPrice: Number(property.price).toLocaleString('es-CO'),
        handleImageError,
    };
}
