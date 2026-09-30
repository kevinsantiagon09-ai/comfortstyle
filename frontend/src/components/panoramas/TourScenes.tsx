import type { TourScenesProps } from '../../types/panorama';
import { propertyImageUrl } from '../../utils/imageUrl';

/** Tira de espacios del recorrido; tocar uno cambia de escena. */
export default function TourScenes({ panoramas, activeIndex, onSelect }: TourScenesProps) {
    return (
        <ul aria-label="Espacios del recorrido" className="flex gap-2 overflow-x-auto pb-1">
            {panoramas.map((panorama, index) => {
                const active = index === activeIndex;
                return (
                    <li key={panorama.id} className="shrink-0">
                        <button
                            type="button"
                            aria-current={active}
                            onClick={() => onSelect(index)}
                            className={`group w-28 overflow-hidden rounded-xl text-left ring-2 transition ${active ? 'ring-blue-600' : 'ring-transparent hover:ring-slate-300'}`}
                        >
                            <img src={propertyImageUrl(panorama.preview_path)} alt="" loading="lazy" className="h-14 w-full object-cover" />
                            <span className={`block truncate px-2 py-1 text-xs font-medium ${active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                {panorama.title}
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
