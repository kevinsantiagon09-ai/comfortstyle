import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Pencil, Plus, Send } from 'lucide-react';
import { useHostProperties } from '../../features/properties/hooks/useHostProperties';
import { hasSetupProgress, usePropertySetupStore } from '../../features/properties/store/usePropertySetupStore';
import { apiError } from '../../features/properties/utils/apiError';
import { formatPrice } from '../../features/properties/utils/propertyForm';
import { propertyImageUrl } from '../../utils/imageUrl';

export default function HostDashboard() {
    const [page, setPage] = useState(1);
    const properties = useHostProperties(page);
    const localDraft = usePropertySetupStore((state) => hasSetupProgress(state) ? state.form.name.trim() || 'Sin nombre' : null);
    const result = properties.data;

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mis alojamientos</h1>
                    <p className="mt-2 text-slate-600">Crea, completa y publica tus alojamientos.</p>
                </div>
                <Link to="/host/setup" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">
                    <Plus aria-hidden="true" className="h-5 w-5" />
                    {localDraft ? 'Continuar configuración' : 'Nuevo alojamiento'}
                </Link>
            </div>

            {localDraft && (
                <p role="status" className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                    Tienes una configuración sin guardar: «{localDraft}».
                </p>
            )}

            {properties.isPending && <p role="status">Cargando alojamientos…</p>}
            {properties.isError && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
                    {apiError(properties.error)}{' '}
                    <button type="button" onClick={() => void properties.refetch()} className="underline">Reintentar</button>
                </p>
            )}
            {result && result.total === 0 && <p>Aún no tienes alojamientos.</p>}

            {result && result.data.length > 0 && (
                <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${properties.isPlaceholderData ? 'opacity-60' : ''}`}>
                    {result.data.map((property) => {
                        const cover = property.images.find((image) => image.is_cover) ?? property.images[0];
                        return (
                            <li key={property.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <img src={propertyImageUrl(cover?.image_path)} alt="" className="h-40 w-full object-cover" />
                                <div className="space-y-2 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="font-semibold">{property.name}</h2>
                                        <span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${property.is_active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {property.is_active ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </div>
                                    <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />{property.city}, {property.department}</p>
                                    <p className="text-slate-900"><strong>{formatPrice(property)}</strong> <span className="text-sm text-slate-500">por noche</span></p>
                                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                                        <Link to={`/host/properties/${property.id}/edit`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
                                            <Pencil aria-hidden="true" className="h-4 w-4" />Editar
                                        </Link>
                                        <Link to={`/host/setup?property=${property.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-400">
                                            {property.is_active ? <><Camera aria-hidden="true" className="h-4 w-4" />Fotografías</> : <><Send aria-hidden="true" className="h-4 w-4" />Publicar</>}
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {result && result.last_page > 1 && (
                <nav aria-label="Paginación" className="flex items-center justify-center gap-4">
                    <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Anterior</button>
                    <span className="text-sm text-slate-600">Página {result.current_page} de {result.last_page}</span>
                    <button type="button" disabled={page >= result.last_page || properties.isPlaceholderData} onClick={() => setPage(page + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Siguiente</button>
                </nav>
            )}
        </section>
    );
}
