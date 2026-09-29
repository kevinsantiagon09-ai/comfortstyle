import { propertyImageUrl } from '../../utils/imageUrl';
import type { PropertyGalleryProps } from '../../types/property';

export default function PropertyGallery({ images, name }: PropertyGalleryProps) {
    const [main, ...rest] = images;

    return (
        <div className="grid gap-2 overflow-hidden rounded-2xl sm:grid-cols-4 sm:grid-rows-2">
            <img
                src={propertyImageUrl(main?.image_path)}
                alt={main?.caption ?? name}
                className="h-72 w-full object-cover sm:col-span-2 sm:row-span-2 sm:h-full"
            />
            {rest.slice(0, 4).map((image) => (
                <img
                    key={image.id}
                    src={propertyImageUrl(image.image_path)}
                    alt={image.caption ?? name}
                    loading="lazy"
                    className="hidden h-40 w-full object-cover sm:block"
                />
            ))}
        </div>
    );
}
