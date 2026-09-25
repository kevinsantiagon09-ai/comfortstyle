import { useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth.api';
import { AuthContext } from './auth-context';
import type { AuthUser, LoginCredentials, RegisterData } from '../types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        authApi.me().then((user) => {
            if (active) setUser(user);
        }).catch(() => {
            if (active) setUser(null);
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, []);
    const login = async (credentials: LoginCredentials) => {
        const response = await authApi.login(credentials);
        setUser(response.data);
    };
    const register = async (data: RegisterData) => {
        const response = await authApi.register(data);
        setUser(response.data);
    };
    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };
    return <AuthContext.Provider value={{ user, loading, isAuthenticated: user !== null, login, register, logout }}>
        {children}
    </AuthContext.Provider>;
}
