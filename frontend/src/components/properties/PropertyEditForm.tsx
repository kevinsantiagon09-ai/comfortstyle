import { Link } from 'react-router-dom';
import { Save } from 'lucide-react';
import { EDIT_TABS, PANORAMA_TAB, PHOTOS_STEP, SETUP_STEPS } from '../../constants/propertySetup';
import { usePropertyEditForm } from '../../hooks/properties/usePropertyEditForm';
import { paths } from '../../routes/paths';
import type { PropertyEditFormProps } from '../../types/propertyForm';
import { apiError } from '../../utils/apiError';
import PanoramaManager from '../panoramas/PanoramaManager';
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
        <PropertyEditTabs steps={EDIT_TABS} tabProps={tabs.tabProps} tabsWithErrors={tabsWithErrors} />

        <div {...tabs.panelProps}>
            {/* Las fotos y el recorrido 360° se guardan al subirlos, por eso sus pestañas no forman parte del formulario. */}
            {tab === PHOTOS_STEP ? <PropertyPhotosStep propertyUuid={property.uuid} />
                : tab === PANORAMA_TAB ? <PanoramaManager propertyId={property.id} />
                : <form onSubmit={submit} noValidate className="space-y-6">
                <FormSection step={SETUP_STEPS[tab]}>
                    {tab === 0 && <DetailsFields {...sectionProps} />}
                    {tab === 1 && <LocationFields {...sectionProps} />}
                    {tab === 2 && <CapacityFields {...sectionProps} />}
                    {tab === 4 && <PropertyAmenitiesPicker selected={form.amenities} onToggle={toggleAmenity} disabled={pending} error={errors.amenities} />}
                </FormSection>

                {hasErrors && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">Revisa los campos marcados en rojo.</p>}
                {showRequestError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{apiError(requestError)}</p>}
                <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                    <Link to={paths.host} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
                    <button disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
                        <Save aria-hidden="true" className="h-4 w-4" />{pending ? 'Guardando edición…' : 'Guardar edición'}
                    </button>
                </div>
            </form>}
        </div>
    </div>;
}
