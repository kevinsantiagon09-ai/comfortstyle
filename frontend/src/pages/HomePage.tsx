import Navbar from '../componets/Navbar';
import PropertyCard from '../componets/PropertyCard';
import { useProperties } from '../hooks/useProperties';

export default function HomePage() {
    const {
        properties,
        loading,
        error,
        reload,
    } = useProperties();

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8">
                <section className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Encuentra un alojamiento cómodo
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Explora alojamientos y experiencias en tu destino.
                    </p>
                </section>

                {loading && (
                    <p className="text-slate-600">
                        Cargando alojamientos...
                    </p>
                )}

                {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-red-700">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => void reload()}
                            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && properties.length === 0 && (
                    <p>No existen alojamientos disponibles.</p>
                )}

                {!loading && !error && (
                    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                            />
                        ))}
                    </section>
                )}
            </main>
        </>
    );
}