import type { SyntheticEvent } from 'react';
import type { Property } from '../../types/property';
import { fallbackImage, propertyImageUrl } from '../../utils/imageUrl';
import { coverImage } from '../../utils/property';

export function usePropertyCard(property: Property) {
    const cover = coverImage(property);
    const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
        if (event.currentTarget.getAttribute('src') !== fallbackImage) {
            event.currentTarget.src = fallbackImage;
        }
    };

    return {
        imageUrl: propertyImageUrl(cover?.image_path),
        imageAlt: cover?.caption ?? property.name,
        formattedPrice: Number(property.price).toLocaleString('es-CO'),
        handleImageError,
    };
}
