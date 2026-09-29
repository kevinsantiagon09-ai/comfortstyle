import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropertyPhotosStep from '../../components/properties/PropertyPhotosStep';
import PropertySetupWizard from '../../components/properties/PropertySetupWizard';
import SetupProgress from '../../components/properties/SetupProgress';
import { usePropertySetupPage } from '../../hooks/properties/usePropertySetupPage';
import { paths } from '../../routes/paths';

export default function PropertySetupPage() {
    const { propertyId, invalidProperty, activeStep, showPhotos } = usePropertySetupPage();

    if (invalidProperty) return <p role="alert">El alojamiento seleccionado no es válido. <Link to={paths.host}>Volver al panel</Link></p>;

    return <section className="mx-auto max-w-3xl">
        <Link to={paths.host} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Mis alojamientos</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-700">Comienza a recibir huéspedes</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Configuremos tu alojamiento</h1>
        <p className="mt-3 text-slate-600">Completa los pasos y registra tu alojamiento listo para recibir huéspedes.</p>
        <SetupProgress activeStep={activeStep} />
        {propertyId
            ? <PropertyPhotosStep key={propertyId} propertyId={propertyId} />
            : <PropertySetupWizard onCreated={showPhotos} />}
    </section>;
}
