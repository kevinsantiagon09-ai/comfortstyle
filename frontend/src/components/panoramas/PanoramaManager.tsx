import { ImagePlus, Rotate3d, Trash2, Upload } from 'lucide-react';
import { MAX_PANORAMAS, PANORAMA_SLOTS } from '../../constants/panoramas';
import { usePanoramaManager } from '../../hooks/propertyPanoramas/usePanoramaManager';
import type { PanoramaManagerProps } from '../../types/panorama';
import { apiError } from '../../utils/apiError';
import PanoramaPreview from './PanoramaPreview';

/** Sección del anfitrión para armar el recorrido virtual, un espacio a la vez. */
export default function PanoramaManager({ propertyId }: PanoramaManagerProps) {
    const manager = usePanoramaManager(propertyId);
    const used = new Set((manager.panoramas.data ?? []).map((panorama) => panorama.title.trim().toLowerCase()));
    const suggestions = PANORAMA_SLOTS.filter((slot) => !used.has(slot.title.toLowerCase()));

    return (
        <section aria-labelledby="pano-edit-title" className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="min-w-0">
                    <h2 id="pano-edit-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <Rotate3d aria-hidden="true" className="h-5 w-5 text-blue-700" />
                        Recorrido virtual 360°
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Una foto por espacio. Si es 360° real (cámara 360° o «Photo Sphere») se usa tal cual; cualquier otra foto JPG, PNG o WEBP de hasta 100 MB se convierte automáticamente en un panorama simulado.
                        Evita personas, documentos y reflejos en espejos.
                    </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{manager.count}/{MAX_PANORAMAS}</span>
            </header>

            <div className="space-y-5 p-5">
                {manager.panoramas.isPending && <p role="status" className="text-sm text-slate-600">Cargando recorrido…</p>}
                {manager.panoramas.isError && <p role="alert" className="text-sm text-red-700">{apiError(manager.panoramas.error)}</p>}

                {manager.count > 0 && (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {manager.panoramas.data?.map((panorama) => (
                            <li key={panorama.id} className={`group relative aspect-[2/1] overflow-hidden rounded-xl border border-slate-200 ${manager.removingId === panorama.id ? 'opacity-50' : ''}`}>
                                <PanoramaPreview path={panorama.preview_path} height={140} className="h-full w-full" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-2.5 pb-1.5 pt-6">
                                    <span className="block truncate text-xs font-semibold text-white">{panorama.title}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => manager.remove(panorama.id)}
                                    disabled={manager.removingId === panorama.id}
                                    aria-label={`Eliminar ${panorama.title}`}
                                    className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1.5 text-slate-600 shadow-sm hover:text-red-700 disabled:opacity-50"
                                >
                                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {manager.limitReached ? (
                    <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Llegaste al máximo de {MAX_PANORAMAS} espacios. Elimina uno para agregar otro.</p>
                ) : (
                    <form onSubmit={manager.submit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <p className="text-sm font-semibold text-slate-800">Agregar espacio</p>
                        {suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5" aria-label="Espacios sugeridos">
                                {suggestions.map(({ key, title, icon: Icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => manager.changeTitle(title)}
                                        aria-pressed={manager.title === title}
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${manager.title === title ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'}`}
                                    >
                                        <Icon aria-hidden="true" className="h-3.5 w-3.5" />{title}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                            <label className="text-xs font-medium text-slate-600">
                                Nombre del espacio
                                <input
                                    value={manager.title}
                                    onChange={(event) => manager.changeTitle(event.target.value)}
                                    maxLength={100}
                                    placeholder="Ej.: Sala"
                                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                />
                            </label>
                            <label className="text-xs font-medium text-slate-600">
                                Foto
                                <span className={`mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed bg-white px-3 py-2 text-sm ${manager.file ? 'border-green-400 text-slate-800' : 'border-slate-300 text-slate-500 hover:border-blue-400'}`}>
                                    <Upload aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-700" />
                                    <span className="truncate">{manager.file ? manager.file.name : 'Elegir archivo…'}</span>
                                    <input key={manager.fileInputKey} type="file" accept=".jpg,.jpeg,.webp,.png" onChange={manager.chooseFile} className="sr-only" />
                                </span>
                            </label>
                            <button
                                type="submit"
                                disabled={manager.pending}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                            >
                                <ImagePlus aria-hidden="true" className="h-4 w-4" />
                                {manager.progress !== null ? `Subiendo ${manager.progress}%` : manager.pending ? 'Revisando…' : 'Agregar'}
                            </button>
                        </div>
                        {manager.progress !== null && (
                            <div role="progressbar" aria-valuenow={manager.progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                                <div className="h-full bg-blue-600 transition-all" style={{ width: `${manager.progress}%` }} />
                            </div>
                        )}
                    </form>
                )}

                {manager.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{manager.error}</p>}
            </div>
        </section>
    );
}
