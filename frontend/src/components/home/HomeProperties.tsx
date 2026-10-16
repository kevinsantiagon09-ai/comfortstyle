import { ArrowRight } from 'lucide-react';
import type { HomePropertiesProps } from '../../types/home';
import PropertyCard from '../properties/PropertyCard';

export default function HomeProperties({ properties, loading, error, onRetry, limit, onSeeAll }: HomePropertiesProps) {
    const visible = limit ? properties.slice(0, limit) : properties;

    return <section>
        <div className="mb-5 flex items-end justify-between gap-4">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900">{limit ? 'Hospedajes destacados' : 'Todos los hospedajes'}</h2>
                <p className="mt-1 text-sm text-slate-500">Recorre cada espacio en 360° antes de reservar.</p>
            </div>
            {onSeeAll && properties.length > visible.length && <button type="button" onClick={onSeeAll} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">
                Ver todos<ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>}
        </div>

        {loading ? <div role="status" aria-label="Cargando alojamientos" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-[4/3] rounded-2xl bg-slate-200" /><div className="mt-3 h-4 w-2/3 rounded bg-slate-200" /><div className="mt-2 h-3 w-1/3 rounded bg-slate-100" /></div>)}
        </div>
            : error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                <p className="font-semibold">{error}</p>
                <button type="button" onClick={onRetry} className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Reintentar</button>
            </div>
            : visible.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Todavía no hay alojamientos publicados.</p>
            : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map((property) => <PropertyCard key={property.id} property={property} />)}</div>}
    </section>;
}
