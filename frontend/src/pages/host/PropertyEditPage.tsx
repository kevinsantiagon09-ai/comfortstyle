import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropertyEditForm from '../../components/properties/PropertyEditForm';
import PropertyVisibilityToggle from '../../components/properties/PropertyVisibilityToggle';
import { usePropertyEditPage } from '../../hooks/properties/usePropertyEditPage';
import { paths } from '../../routes/paths';
import { apiError } from '../../utils/apiError';

export default function PropertyEditPage() {
    const { valid, property } = usePropertyEditPage();
    const data = property.data;

    return <section className="mx-auto max-w-5xl">
        <Link to={paths.host} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Mis alojamientos</Link>

        <header className="mt-6 mb-6 space-y-5">
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Editar alojamiento</p>
                <h1 className="mt-1 truncate text-3xl font-extrabold text-slate-900 sm:text-4xl">{data?.name ?? 'Tu alojamiento'}</h1>
                <p className="mt-2 text-sm text-slate-500">Los cambios de cada pestaña se guardan con «Guardar cambios». Las fotos y el recorrido 360° se guardan al subirlos.</p>
            </div>
            {data && <PropertyVisibilityToggle property={data} />}
        </header>

        {!valid ? <p role="alert">El alojamiento seleccionado no es válido.</p>
            : property.isPending ? <p role="status">Cargando alojamiento…</p>
            : property.isError ? <p role="alert">{apiError(property.error)} <button type="button" onClick={() => void property.refetch()} className="text-blue-700 underline">Reintentar</button></p>
            : <PropertyEditForm key={property.data.id} property={property.data} />}
    </section>;
}
