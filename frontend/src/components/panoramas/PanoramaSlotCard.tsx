import { useState, type DragEvent } from 'react';
import { CircleCheck, GripVertical, Trash2, Upload } from 'lucide-react';
import { usePanoramaSlot } from '../../hooks/propertyPanoramas/usePanoramaSlot';
import type { PanoramaSlotCardProps } from '../../types/panorama';

/** Contenedor de un espacio (proporción 2:1, como la foto): se arrastra una foto 360° o se hace clic para elegirla. */
/** Tipo propio para distinguir el arrastre de una miniatura del arrastre de archivos. */
const SLOT_DRAG_TYPE = 'application/x-panorama-slot';

export default function PanoramaSlotCard({ slot, draft, error: backendError, onPick, onClear, onMove, disabled }: PanoramaSlotCardProps) {
    const [dropTarget, setDropTarget] = useState(false);
    const { dropzone: { getRootProps, getInputProps, isDragActive }, previewUrl, error: localError, reading } = usePanoramaSlot({ draft, onPick, disabled }, slot.title);
    const error = localError ?? backendError;
    const Icon = slot.icon;
    const isSlotDrag = (event: DragEvent) => event.dataTransfer.types.includes(SLOT_DRAG_TYPE);
    const dragThumbnail = (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData(SLOT_DRAG_TYPE, slot.key);
        event.dataTransfer.effectAllowed = 'move';
        const image = event.currentTarget.querySelector('img');
        if (image) event.dataTransfer.setDragImage(image, image.width / 2, image.height / 2);
    };
    const tone = dropTarget ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : isDragActive ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
        : error ? 'border-red-500 bg-red-50'
        : draft ? 'border-slate-200'
        : 'border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50';

    return <li
        className="min-w-0"
        onDragOver={(event) => { if (!disabled && isSlotDrag(event)) { event.preventDefault(); setDropTarget(true); } }}
        onDragLeave={() => setDropTarget(false)}
        onDrop={(event) => {
            setDropTarget(false);
            if (disabled || !isSlotDrag(event)) return;
            event.preventDefault();
            const from = event.dataTransfer.getData(SLOT_DRAG_TYPE);
            if (from && from !== slot.key) onMove(from);
        }}
    >
        <div {...getRootProps({ draggable: Boolean(draft) && !disabled, onDragStart: draft ? dragThumbnail : undefined, className: `group relative aspect-[2/1] cursor-pointer overflow-hidden rounded-xl border transition ${tone} ${draft ? 'cursor-grab active:cursor-grabbing' : ''} ${disabled || reading ? 'cursor-wait opacity-60' : ''}` })}>
            <input {...getInputProps()} aria-label={`Foto 360° de ${slot.title}`} aria-invalid={error ? true : undefined} />
            {previewUrl
                ? <>
                    <img src={previewUrl} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                    <GripVertical aria-hidden="true" className="absolute left-1 top-1.5 h-4 w-4 text-white/90 drop-shadow" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-slate-900/80 to-transparent px-2.5 pb-1.5 pt-6 text-white">
                        <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-green-400" />
                        <span className="truncate text-xs font-semibold">{slot.title}</span>
                        {draft?.converted && <span className="ml-auto shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium">Convertida</span>}
                    </div>
                    <button type="button" disabled={disabled} onClick={(event) => { event.stopPropagation(); onClear(); }} aria-label={`Quitar foto 360° de ${slot.title}`} className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1.5 text-slate-600 shadow-sm hover:text-red-700 disabled:opacity-50">
                        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                </>
                : <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full ${error ? 'bg-red-100 text-red-700' : 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'}`}>
                        <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold leading-tight text-slate-800">{slot.title}</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Upload aria-hidden="true" className="h-3 w-3" />{reading ? 'Revisando…' : isDragActive ? 'Suéltala aquí' : 'Arrastra o elige'}
                    </span>
                </div>}
        </div>
        {error && <p role="alert" className="mt-1 text-[11px] leading-snug text-red-700">{error}</p>}
    </li>;
}
