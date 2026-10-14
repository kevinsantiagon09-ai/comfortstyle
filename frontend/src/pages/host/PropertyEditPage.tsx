import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import PropertyEditForm from '../../components/properties/PropertyEditForm';
import { usePropertyEditPage } from '../../hooks/properties/usePropertyEditPage';
import { paths } from '../../routes/paths';
import { apiError } from '../../utils/apiError';

export default function PropertyEditPage() {
    const { valid, property } = usePropertyEditPage();
    const data = property.data;

    return <section className="mx-auto max-w-5xl">
        <Link to={paths.host} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Mis alojamientos</Link>

        <header className="mt-6 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
                <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl"><Pencil aria-hidden="true" className="h-6 w-6 shrink-0 text-blue-700" />Editar alojamiento</h1>
                {data && <p className="mt-1 truncate text-sm text-slate-500">{data.name}</p>}
            </div>
            {data && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data.is_active ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{data.is_active ? 'Publicado' : 'Borrador'}</span>}
        </header>

        {!valid ? <p role="alert">El alojamiento seleccionado no es válido.</p>
            : property.isPending ? <p role="status">Cargando alojamiento…</p>
            : property.isError ? <p role="alert">{apiError(property.error)} <button type="button" onClick={() => void property.refetch()} className="text-blue-700 underline">Reintentar</button></p>
            : <PropertyEditForm key={property.data.id} property={property.data} />}
    </section>;
}
