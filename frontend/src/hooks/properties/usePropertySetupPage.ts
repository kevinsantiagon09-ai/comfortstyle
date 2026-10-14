import { useSearchParams } from 'react-router-dom';
import { PHOTOS_STEP } from '../../constants/propertySetup';
import { usePropertySetupStore } from '../../store/propertySetupStore';
import { toUuid } from '../../utils/routeParams';

/** `?property=<id>` indica que el alojamiento ya existe y se están gestionando sus fotos. */
export function usePropertySetupPage() {
    const [params, setParams] = useSearchParams();
    const rawId = params.get('property');
    const propertyUuid = rawId === null ? null : toUuid(rawId);
    const step = usePropertySetupStore((state) => state.step);

    return {
        propertyUuid,
        invalidProperty: rawId !== null && propertyUuid === null,
        activeStep: propertyUuid ? PHOTOS_STEP : step,
        showPhotos: (uuid: string) => setParams({ property: uuid }, { replace: true }),
    };
}
