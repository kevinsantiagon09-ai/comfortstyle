import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import HostPropertyCard from '../../components/properties/HostPropertyCard';
import Pagination from '../../components/ui/Pagination';
import { useHostDashboard } from '../../hooks/properties/useHostDashboard';
import { paths } from '../../routes/paths';
import { apiError } from '../../utils/apiError';

export default function HostDashboard() {
    const { page, properties, result, localDraft, previousPage, nextPage } = useHostDashboard();

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mis alojamientos</h1>
                    <p className="mt-2 text-slate-600">Crea, completa y publica tus alojamientos.</p>
                </div>
                <Link to={paths.hostSetup} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">
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
                    {result.data.map((property) => <HostPropertyCard key={property.id} property={property} />)}
                </ul>
            )}

            {result && result.last_page > 1 && (
                <Pagination
                    page={page}
                    currentPage={result.current_page}
                    lastPage={result.last_page}
                    onPrevious={previousPage}
                    onNext={nextPage}
                    nextDisabled={properties.isPlaceholderData}
                />
            )}
        </section>
    );
}
