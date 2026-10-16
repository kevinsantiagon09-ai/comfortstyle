import { useSearchParams } from 'react-router-dom';
import { DEFAULT_HOME_CATEGORY, HOME_CATEGORIES } from '../../constants/home';
import type { HomeCategoryId } from '../../types/home';
import { useRoleMode } from '../layout/useRoleMode';
import { usePublicProperties } from '../properties/usePublicProperties';

/** La categoría vive en la URL (?vista=hospedajes) para que se pueda compartir y volver con "atrás". */
export function useHomePage() {
    const { user, mode } = useRoleMode();
    const properties = usePublicProperties();
    const [searchParams, setSearchParams] = useSearchParams();
    const requested = searchParams.get('vista');
    const category: HomeCategoryId = HOME_CATEGORIES.find((item) => item.id === requested)?.id ?? DEFAULT_HOME_CATEGORY;

    const selectCategory = (next: HomeCategoryId) => {
        setSearchParams(next === DEFAULT_HOME_CATEGORY ? {} : { vista: next });
    };

    return {
        mode,
        firstName: user?.name.trim().split(/\s+/)[0] ?? null,
        category,
        selectCategory,
        properties,
        propertyCount: properties.loading || properties.error ? null : properties.properties.length,
    };
}
