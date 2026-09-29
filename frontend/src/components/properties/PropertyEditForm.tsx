import { Link } from 'react-router-dom';
import { Save } from 'lucide-react';
import { SETUP_STEPS } from '../../constants/propertySetup';
import { usePropertyEditForm } from '../../hooks/properties/usePropertyEditForm';
import { hostPropertyPhotosPath, paths } from '../../routes/paths';
import type { PropertyEditFormProps } from '../../types/propertyForm';
import { apiError } from '../../utils/apiError';
import CapacityFields from './CapacityFields';
import DetailsFields from './DetailsFields';
import FormSection from './FormSection';
import LocationFields from './LocationFields';
import PropertyAmenitiesPicker from './PropertyAmenitiesPicker';

/** Secciones editables, en el mismo orden y con los mismos iconos que el registro (las fotos se editan aparte). */
const [details, location, capacity, photos, amenities] = SETUP_STEPS;

export default function PropertyEditForm({ property }: PropertyEditFormProps) {
    const { form, errors, hasErrors, pending, requestError, showRequestError, change, toggleAmenity, submit } = usePropertyEditForm(property);
    const sectionProps = { form, errors, change };

    return <form onSubmit={submit} noValidate className="space-y-6">
        <FormSection step={details}><DetailsFields {...sectionProps} /></FormSection>
        <FormSection step={location}><LocationFields {...sectionProps} /></FormSection>
        <FormSection step={capacity}><CapacityFields {...sectionProps} /></FormSection>
        <FormSection step={amenities}><PropertyAmenitiesPicker selected={form.amenities} onToggle={toggleAmenity} disabled={pending} error={errors.amenities} /></FormSection>

        <Link to={hostPropertyPhotosPath(property.id)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 font-medium text-blue-700 shadow-sm hover:border-blue-300">
            <photos.icon aria-hidden="true" className="h-6 w-6" />Gestionar fotografías
        </Link>

        {hasErrors && <p role="alert" className="text-red-700">Revisa los campos marcados.</p>}
        {showRequestError && <p role="alert" className="text-red-700">{apiError(requestError)}</p>}
        <div className="flex items-center justify-between gap-4">
            <Link to={paths.host} className="rounded-xl border px-5 py-3">Cancelar</Link>
            <button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50">
                <Save aria-hidden="true" className="h-5 w-5" />{pending ? 'Guardando…' : 'Guardar cambios'}
            </button>
        </div>
    </form>;
}
