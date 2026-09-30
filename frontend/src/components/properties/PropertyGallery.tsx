import { propertyImageUrl } from '../../utils/imageUrl';
import { galleryThumbClass } from '../../utils/photos';
import type { PropertyGalleryProps } from '../../types/property';

export default function PropertyGallery({ images, name }: PropertyGalleryProps) {
    const [main, ...rest] = images;
    const thumbs = rest.slice(0, 4);

    return (
        <div className="grid h-72 gap-2 overflow-hidden rounded-2xl sm:h-[440px] sm:grid-cols-4 sm:grid-rows-2">
            <img
                src={propertyImageUrl(main?.image_path)}
                alt={main?.caption ?? name}
                className={`size-full cursor-pointer object-cover transition hover:brightness-90 sm:row-span-2 ${
                    thumbs.length ? 'sm:col-span-2' : 'sm:col-span-4'
                }`}
            />
            {thumbs.map((image, index) => (
                <img
                    key={image.id}
                    src={propertyImageUrl(image.image_path)}
                    alt={image.caption ?? name}
                    loading="lazy"
                    className={`hidden size-full cursor-pointer object-cover transition hover:brightness-90 sm:block ${galleryThumbClass(index, thumbs.length)}`}
                />
            ))}
        </div>
    );
}
