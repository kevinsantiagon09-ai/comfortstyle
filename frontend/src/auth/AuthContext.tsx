import type { ReactNode } from 'react';
import { AuthContext } from './auth-context';
import { useSession } from '../hooks/useSession';

export function AuthProvider({ children }: { children: ReactNode }) {
    const session = useSession();

    return <AuthContext.Provider value={session}>
        {children}
    </AuthContext.Provider>;
}
