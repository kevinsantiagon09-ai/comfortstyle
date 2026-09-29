import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getHostProperties } from '../../api/properties.api';
import { queryKeys } from '../../api/queryKeys';

/** Alojamientos del anfitrión, paginados; conserva la página anterior mientras carga la siguiente. */
export function useHostProperties(page: number) {
    return useQuery({
        queryKey: queryKeys.hostPropertyList(page),
        queryFn: ({ signal }) => getHostProperties(page, signal),
        placeholderData: keepPreviousData,
    });
}
