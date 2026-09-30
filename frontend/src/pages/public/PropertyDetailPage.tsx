import VirtualTour from '../../components/panoramas/VirtualTour';
import VirtualTourButton from '../../components/panoramas/VirtualTourButton';
import PropertyLocationSection from '../../components/map/PropertyLocationSection';
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

            <div className="space-y-8">
                {property.host && <p className="text-slate-700">Anfitrión: <strong>{property.host.name}</strong></p>}
                <p className="whitespace-pre-line text-slate-700">{property.description}</p>
                <PropertyAmenitiesList groups={amenityGroups} />
                <PropertyFeatures property={property} />
                <PropertyLocationSection property={property} />
            </div>

            <aside id={reservationId} className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 p-6 shadow-sm md:max-w-md">
                <p className="text-slate-900">
                    <strong className="text-2xl">${formattedPrice}</strong> {property.currency} por noche
                </p>
                <ReservationForm property={property} />
            </aside>
        </article>
    );
}
