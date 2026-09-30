import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import PanoramaManager from '../../components/panoramas/PanoramaManager';
import PropertyEditForm from '../../components/properties/PropertyEditForm';
import { usePropertyEditPage } from '../../hooks/properties/usePropertyEditPage';
import { paths } from '../../routes/paths';

import { apiError } from '../../utils/apiError';

export default function PropertyEditPage() {
    const { valid, property } = usePropertyEditPage();

    return <section className="mx-auto max-w-3xl">
        <Link to={paths.host} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Mis alojamientos</Link>
        
        <h1 className="mt-8 flex items-center gap-3 text-3xl font-bold text-slate-900"><Pencil aria-hidden="true" className="h-7 w-7 shrink-0 text-blue-700" />Editar alojamiento</h1>
        {!valid ? <p role="alert" className="mt-6">El alojamiento seleccionado no es válido.</p>
            : property.isPending ? <p role="status" className="mt-6">Cargando Alojamiento…</p>
            : property.isError ? <p role="alert" className="mt-6">{apiError(property.error)} <button type="button" onClick={() => void property.refetch()} className="text-blue-700 underline">Reintentar</button></p>
            : <>
               
                <div className="mt-6"><PropertyEditForm key={property.data.id} property={property.data} />
                
                </div>
                <PanoramaManager propertyId={property.data.id} />
            </>}
    </section>;
}
