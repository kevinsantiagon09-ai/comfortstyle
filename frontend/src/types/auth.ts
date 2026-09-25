export type UserRole = 'ARRENDATARIO' | 'ARRENDADOR';

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

export interface AuthResponse {
    message: string;
    data: AuthUser;
}