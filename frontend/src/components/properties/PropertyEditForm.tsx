import { Link } from 'react-router-dom';
import { Save } from 'lucide-react';
import { PHOTOS_STEP, SETUP_STEPS } from '../../constants/propertySetup';
import { usePropertyEditForm } from '../../hooks/properties/usePropertyEditForm';
import { paths } from '../../routes/paths';
import type { PropertyEditFormProps } from '../../types/propertyForm';
import { apiError } from '../../utils/apiError';
import CapacityFields from './CapacityFields';
import DetailsFields from './DetailsFields';
import FormSection from './FormSection';
import LocationFields from './LocationFields';
import PropertyAmenitiesPicker from './PropertyAmenitiesPicker';
import PropertyEditTabs from './PropertyEditTabs';
import PropertyPhotosStep from './PropertyPhotosStep';

/** Una pestaña por sección, en el mismo orden y con los mismos nombres que el registro. */
export default function PropertyEditForm({ property }: PropertyEditFormProps) {
    const { tabs, tabsWithErrors, form, errors, hasErrors, pending, requestError, showRequestError, change, toggleAmenity, submit } = usePropertyEditForm(property);
    const sectionProps = { form, errors, change };
    const tab = tabs.active;

    return <div className="space-y-6">
        <PropertyEditTabs steps={SETUP_STEPS} tabProps={tabs.tabProps} tabsWithErrors={tabsWithErrors} />

        <div {...tabs.panelProps}>
            {/* Las fotos se guardan al subirlas, por eso su pestaña no forma parte del formulario. */}
            {tab === PHOTOS_STEP ? <PropertyPhotosStep propertyId={property.id} /> : <form onSubmit={submit} noValidate className="space-y-6">
                <FormSection step={SETUP_STEPS[tab]}>
                    {tab === 0 && <DetailsFields {...sectionProps} />}
                    {tab === 1 && <LocationFields {...sectionProps} />}
                    {tab === 2 && <CapacityFields {...sectionProps} />}
                    {tab === 4 && <PropertyAmenitiesPicker selected={form.amenities} onToggle={toggleAmenity} disabled={pending} error={errors.amenities} />}
                </FormSection>

                {hasErrors && <p role="alert" className="text-red-700">Revisa los campos marcados.</p>}
                {showRequestError && <p role="alert" className="text-red-700">{apiError(requestError)}</p>}
                <div className="flex items-center justify-between gap-4">
                    <Link to={paths.host} className="rounded-xl border px-5 py-3">Cancelar</Link>
                    <button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50">
                        <Save aria-hidden="true" className="h-5 w-5" />{pending ? 'Guardando…' : 'Actualizar'}
                    </button>
                </div>
            </form>}
        </div>
    </div>;
}
