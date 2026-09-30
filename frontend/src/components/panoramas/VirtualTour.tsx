import { CalendarCheck, Rotate3d, X } from 'lucide-react';
import { useTourScenes } from '../../hooks/propertyPanoramas/useTourScenes';
import type { VirtualTourProps } from '../../types/panorama';
import PanoramaViewer from './PanoramaViewer';
import TourScenes from './TourScenes';

/** Recorrido abierto en línea, en el mismo lugar de la galería. */
export default function VirtualTour({ panoramas, propertyName, onClose, onReserve }: VirtualTourProps) {
    const { current, activeIndex, select } = useTourScenes(panoramas);

    return (
        <section aria-label={`Recorrido virtual de ${propertyName}`} className="tour-in space-y-3">
            <div className="relative h-80 overflow-hidden rounded-2xl sm:h-[480px]">
                {current && <PanoramaViewer path={current.image_path} title={current.title} />}
                <p className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 text-sm font-medium text-white">
                    <Rotate3d aria-hidden="true" className="h-4 w-4" />
                    {current?.title}
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar recorrido"
                    className="absolute right-4 top-4 rounded-full bg-white/95 p-2 text-slate-800 shadow hover:bg-white"
                >
                    <X aria-hidden="true" className="h-5 w-5" />
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <TourScenes panoramas={panoramas} activeIndex={activeIndex} onSelect={select} />
                <button
                    type="button"
                    onClick={onReserve}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                >
                    <CalendarCheck aria-hidden="true" className="h-5 w-5" />
                    Reservar este lugar
                </button>
            </div>
        </section>
    );
}
