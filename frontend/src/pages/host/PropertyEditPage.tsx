import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import PropertyEditForm from '../../components/properties/PropertyEditForm';
import { usePropertyEditPage } from '../../hooks/properties/usePropertyEditPage';
import { paths } from '../../routes/paths';
import { apiError } from '../../utils/apiError';

export default function PropertyEditPage() {
    const { valid, property } = usePropertyEditPage();

    return <section className="mx-auto max-w-3xl">
        <Link to={paths.host} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Mis alojamientos</Link>
        <h1 className="mt-8 text-3xl font-bold text-slate-900">Editar alojamiento</h1>
        {!valid ? <p role="alert" className="mt-6">El alojamiento seleccionado no es válido.</p>
            : property.isPending ? <p role="status" className="mt-6">Cargando alojamiento…</p>
            : property.isError ? <p role="alert" className="mt-6">{apiError(property.error)} <button type="button" onClick={() => void property.refetch()} className="text-blue-700 underline">Reintentar</button></p>
            : <>
                <p className="mt-3 flex items-center gap-2 text-slate-600"><Pencil aria-hidden="true" className="h-4 w-4 shrink-0" />Actualiza los datos de «{property.data.name}». Los cambios se ven de inmediato en tu publicación.</p>
                <div className="mt-8"><PropertyEditForm key={property.data.id} property={property.data} /></div>
            </>}
    </section>;
}
