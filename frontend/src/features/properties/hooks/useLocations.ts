import { useQuery } from '@tanstack/react-query';
import { getCities, getDepartments } from '../api/hostProperties.api';
export function useLocations(departmentId: string) {
    const departments = useQuery({ queryKey: ['locations', 'departments'], queryFn: ({ signal }) => getDepartments(signal), staleTime: 3_600_000 });
    const cities = useQuery({ queryKey: ['locations', 'cities', departmentId], queryFn: ({ signal }) => getCities(departmentId, signal), enabled: Boolean(departmentId), staleTime: 3_600_000 });
    return { departments, cities };
}
