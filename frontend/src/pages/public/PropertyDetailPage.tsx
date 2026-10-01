import VirtualTour from '../../components/panoramas/VirtualTour';
import VirtualTourButton from '../../components/panoramas/VirtualTourButton';
import PropertyAmenitiesList from '../../components/properties/PropertyAmenitiesList';
import PropertyFeatures from '../../components/properties/PropertyFeatures';
import PropertyGallery from '../../components/properties/PropertyGallery';
import ReservationForm from '../../components/reservations/ReservationForm';
import { usePropertyDetailPage } from '../../hooks/properties/usePropertyDetailPage';

export default function PropertyDetailPage() {
    const { valid, property, amenityGroups, loading, error, formattedPrice, tour, reservationId } = usePropertyDetailPage();

    if (!valid) return <p>El alojamiento no existe.</p>;
    if (loading) return <p className="text-slate-600">Cargando alojamiento...</p>;
    if (error || !property) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;

    return (
        <article className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">{property.name}</h1>
                <p className="mt-1 text-slate-600">{property.city}, {property.department}</p>
            </header>

            {tour.open ? (
                <VirtualTour panoramas={property.panoramas ?? []} propertyName={property.name} onClose={tour.close} onReserve={tour.goToReservation} />
            ) : (
                <div className="relative">
                    <PropertyGallery images={property.images} name={property.name} />
                    {tour.hasTour && (
                        <VirtualTourButton previewPath={tour.previewPath} scenes={property.panoramas?.length ?? 0} onOpen={tour.openTour} />
                    )}
                </div>
            )}

            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                <div className="space-y-10">
                    {property.host && <p className="text-slate-700">Anfitrión: <strong>{property.host.name}</strong></p>}
                    <p className="whitespace-pre-line text-slate-700">{property.description}</p>
                    <PropertyFeatures property={property} />
                    <PropertyAmenitiesList groups={amenityGroups} />
                </div>

                <aside id={reservationId} className="h-fit scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24">
                    <p className="text-slate-900">
                        <strong className="text-2xl">${formattedPrice}</strong> {property.currency} por noche
                    </p>
                    <ReservationForm property={property} />
                </aside>
            </div>
        </article>
    );
}
