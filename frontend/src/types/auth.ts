import type { ApiResponse } from './api';

export type UserRole = 'HUESPED' | 'ANFITRION';

export interface AuthRole {
    id: number;
    name: UserRole;
}

export interface AuthUser {
    id: number;
    uuid: string;
    name: string;
    email: string;
    roles: AuthRole[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: UserRole;
}

export type AuthResponse = ApiResponse<AuthUser>;

export interface AuthSession {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
}

export type AuthField = 'name' | 'email' | 'password' | 'password_confirmation' | 'role';
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

// Props de componentes
export interface AuthFormProps {
    registerMode?: boolean;
}

export interface AuthFieldErrorProps {
    field: AuthField;
    message?: string;
}

export interface RoleRouteProps {
    allowedRole: UserRole;
}
