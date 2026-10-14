import { PHOTOS_STEP, SETUP_STEPS } from '../../constants/propertySetup';
import { PRIMARY_BUTTON_CLASS } from '../../constants/styles';
import { usePropertySetupWizard } from '../../hooks/properties/usePropertySetupWizard';
import type { PropertySetupWizardProps } from '../../types/propertyForm';
import { apiError } from '../../utils/apiError';
import CapacityFields from './CapacityFields';
import DetailsFields from './DetailsFields';
import LocationFields from './LocationFields';
import PropertyAmenitiesPicker from './PropertyAmenitiesPicker';
import PanoramaSlotsPicker from '../panoramas/PanoramaSlotsPicker';
import PropertyPhotoPicker from './PropertyPhotoPicker';

export default function PropertySetupWizard({ onCreated }: PropertySetupWizardProps) {
    const {
        step, form, photos, panoramas, panoramaErrors, createdId, errors, busy, validating, registering, isLastStep, requestError, showRequestError,
        locationsUnavailable, change, changePhotos, changePanoramas, skipPanoramas, toggleAmenity, goBack, submit,
    } = usePropertySetupWizard(onCreated);
    const StepIcon = SETUP_STEPS[step].icon;

    return <form onSubmit={submit} noValidate className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <fieldset disabled={busy} className="space-y-5">
            <legend className="mb-5 flex items-center gap-2 text-xl font-semibold"><StepIcon aria-hidden="true" className="h-6 w-6 text-blue-700" />{SETUP_STEPS[step].label}</legend>
            {step === 0 && <DetailsFields form={form} errors={errors} change={change} autoFocus />}
            {step === 1 && <LocationFields form={form} errors={errors} change={change} />}
            {step === 2 && <CapacityFields form={form} errors={errors} change={change} />}
            {step === PHOTOS_STEP && <>
                <PropertyPhotoPicker files={photos} onChange={changePhotos} disabled={busy} error={errors.images} />
                {createdId && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Tu alojamiento ya fue registrado, pero algunas fotos 360° no se guardaron. Corrígelas o quítalas y vuelve a intentarlo.</p>}
                <PanoramaSlotsPicker drafts={panoramas} errors={panoramaErrors} onChange={changePanoramas} disabled={busy} />
            </>}
            {step === 4 && <>
                <PropertyAmenitiesPicker selected={form.amenities} onToggle={toggleAmenity} disabled={busy} error={errors.amenities} />
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Al registrar, tu alojamiento quedará publicado con tus fotografías y comodidades.</p>
            </>}
        </fieldset>
        {showRequestError && <p role="alert" className="mt-4 text-red-700">{apiError(requestError)}</p>}
        {createdId && <button type="button" onClick={skipPanoramas} disabled={busy} className="mt-4 text-sm text-blue-700 underline disabled:opacity-50">Omitir estas fotos y continuar</button>}
        <div className="mt-8 flex items-center justify-between gap-4">
            <button type="button" disabled={step === 0 || busy || createdId !== null} onClick={goBack} className="rounded-xl border px-5 py-3 disabled:opacity-40">Anterior</button>
            <button className={PRIMARY_BUTTON_CLASS} disabled={busy || locationsUnavailable}>{validating ? 'Validando…' : registering ? 'Registrando…' : createdId ? 'Reintentar fotos 360°' : isLastStep ? 'Registrar alojamiento' : 'Continuar'}</button>
        </div>
        <p className="mt-4 text-xs text-slate-500">Tu avance se conserva en este navegador aunque recargues la página (las fotos y los recorridos 360° deberás elegirlos de nuevo).</p>
    </form>;
}
