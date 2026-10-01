import { ImagePlus, Rotate3d, Trash2 } from 'lucide-react';
import { MAX_PANORAMAS } from '../../constants/panoramas';
import { usePanoramaManager } from '../../hooks/propertyPanoramas/usePanoramaManager';
import type { PanoramaManagerProps } from '../../types/panorama';
import { apiError } from '../../utils/apiError';
import PanoramaPreview from './PanoramaPreview';

/** Sección del anfitrión para armar el recorrido virtual, un espacio a la vez. */
export default function PanoramaManager({ propertyId }: PanoramaManagerProps) {
    const manager = usePanoramaManager(propertyId);

    return (
        <section className="mt-10 space-y-5 rounded-2xl border border-slate-200 p-6">
            <header>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <Rotate3d aria-hidden="true" className="h-6 w-6 text-blue-700" />
                    Recorrido virtual 360°
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Sube una foto 360° por espacio (sala, cocina, habitación…). Tómala con una cámara 360° o con el modo
                    «Photo Sphere» del celular. Debe ser JPG o WEBP, el doble de ancha que de alta y de máximo 20 MB.
                    Revisa que no aparezcan personas, documentos ni reflejos en espejos.
                </p>
            </header>

            {manager.panoramas.isPending && <p role="status" className="text-sm text-slate-600">Cargando recorrido…</p>}
            {manager.panoramas.isError && <p role="alert" className="text-sm text-red-700">{apiError(manager.panoramas.error)}</p>}

            {manager.count > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2">
                    {manager.panoramas.data?.map((panorama) => (
                        <li key={panorama.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2">
                            <PanoramaPreview path={panorama.preview_path} height={64} className="w-28 shrink-0 rounded-lg" />
                            <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{panorama.title}</span>
                            <button
                                type="button"
                                onClick={() => manager.remove(panorama.id)}
                                disabled={manager.removingId === panorama.id}
                                aria-label={`Eliminar ${panorama.title}`}
                                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            >
                                <Trash2 aria-hidden="true" className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {manager.limitReached ? (
                <p className="text-sm text-slate-600">Llegaste al máximo de {MAX_PANORAMAS} espacios. Elimina uno para agregar otro.</p>
            ) : (
                <form onSubmit={manager.submit} noValidate className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <label className="text-sm font-medium text-slate-700">
                        Nombre del espacio
                        <input
                            value={manager.title}
                            onChange={(event) => manager.changeTitle(event.target.value)}
                            maxLength={100}
                            placeholder="Ej.: Sala"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                    </label>
                    <label className="text-sm font-medium text-slate-700">
                        Foto 360°
                        <input
                            key={manager.fileInputKey}
                            type="file"
                            accept=".jpg,.jpeg,.webp"
                            onChange={manager.chooseFile}
                            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-medium"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={manager.pending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                    >
                        <ImagePlus aria-hidden="true" className="h-5 w-5" />
                        {manager.progress !== null ? `Subiendo ${manager.progress}%` : manager.pending ? 'Revisando foto…' : 'Agregar espacio'}
                    </button>
                </form>
            )}

            {manager.error && <p role="alert" className="text-sm text-red-700">{manager.error}</p>}
        </section>
    );
}
