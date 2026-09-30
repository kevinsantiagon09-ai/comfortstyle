import type { CSSProperties } from 'react';
import type { PanoramaPreviewProps } from '../../types/panorama';
import { propertyImageUrl } from '../../utils/imageUrl';

/** Vista previa animada: la foto 360° liviana se desplaza en bucle y parece girar, sin cargar el visor. */
export default function PanoramaPreview({ path, height, className = '' }: PanoramaPreviewProps) {
    const style = {
        '--pano-h': `${height}px`,
        height,
        backgroundImage: `url("${propertyImageUrl(path)}")`,
    } as CSSProperties;

    return <div aria-hidden="true" className={`pano-preview ${className}`} style={style} />;
}
