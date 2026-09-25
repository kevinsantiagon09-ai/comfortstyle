import { createContext } from 'react';
import type { AuthUser, LoginCredentials, RegisterData } from '../types/auth';
interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
