import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../../api/auth.api';
import { queryKeys } from '../../api/queryKeys';
import { clearPropertySetup } from '../../store/propertySetupStore';

/** Cierra la sesión y descarta los datos del usuario que había en caché y en el navegador. */
export function useLogout() {
    const client = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: async () => {
            await client.cancelQueries();
            client.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.session[0] });
            client.setQueryData(queryKeys.session, null);
            clearPropertySetup();
        },
    });
}
