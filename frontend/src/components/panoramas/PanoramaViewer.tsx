import { usePanoramaViewer } from '../../hooks/propertyPanoramas/usePanoramaViewer';
import type { PanoramaViewerProps } from '../../types/panorama';

export default function PanoramaViewer({ path, title }: PanoramaViewerProps) {
    const { container, error } = usePanoramaViewer(path, title);

    return (
        <div className="relative size-full bg-slate-900">
            <div ref={container} className="size-full" />
            {error && (
                <p role="alert" className="absolute inset-0 grid place-items-center p-6 text-center text-white">
                    No fue posible cargar el recorrido. Revisa tu conexión e inténtalo de nuevo.
                </p>
            )}
        </div>
    );
}
