import { useSearchParams } from 'react-router-dom';
import { PHOTOS_STEP } from '../../constants/propertySetup';
import { usePropertySetupStore } from '../../store/propertySetupStore';
import { toPositiveId } from '../../utils/routeParams';

/** `?property=<id>` indica que el alojamiento ya existe y se están gestionando sus fotos. */
export function usePropertySetupPage() {
    const [params, setParams] = useSearchParams();
    const rawId = params.get('property');
    const propertyId = rawId === null ? null : toPositiveId(rawId);
    const step = usePropertySetupStore((state) => state.step);

    return {
        propertyId,
        invalidProperty: rawId !== null && propertyId === null,
        activeStep: propertyId ? PHOTOS_STEP : step,
        showPhotos: (id: number) => setParams({ property: String(id) }, { replace: true }),
    };
}
