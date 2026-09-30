import { Rotate3d } from 'lucide-react';
import type { VirtualTourButtonProps } from '../../types/panorama';
import PanoramaPreview from './PanoramaPreview';

/** Botón flotante sobre la galería con una ventanita que gira mostrando el recorrido. */
export default function VirtualTourButton({ previewPath, scenes, onOpen }: VirtualTourButtonProps) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="group absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/95 py-1.5 pl-1.5 pr-5 text-left shadow-lg ring-1 ring-slate-900/10 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            <span className="relative block size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-blue-600">
                <PanoramaPreview path={previewPath} height={48} className="w-full" />
                <span className="absolute inset-0 animate-ping rounded-full ring-2 ring-blue-500/60 group-hover:hidden" />
            </span>
            <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <Rotate3d aria-hidden="true" className="h-4 w-4 text-blue-700" />
                    Recorrido virtual
                </span>
                <span className="block text-xs text-slate-600">
                    360° · {scenes} {scenes === 1 ? 'espacio' : 'espacios'}
                </span>
            </span>
        </button>
    );
}
