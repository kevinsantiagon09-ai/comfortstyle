import { useCities } from './useCities';
import { useDepartments } from './useDepartments';

export function useLocations(departmentId: string) {
    return {
        departments: useDepartments(),
        cities: useCities(departmentId),
    };
}
