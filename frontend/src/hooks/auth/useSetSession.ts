import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../api/queryKeys';
import type { AuthUser } from '../../types/auth';

/** Reemplaza el usuario de la sesión en caché sin volver a consultar `/me`. */
export function useSetSession() {
    const client = useQueryClient();

    return async (user: AuthUser | null) => {
        await client.cancelQueries({ queryKey: queryKeys.session });
        client.setQueryData(queryKeys.session, user);
    };
}
