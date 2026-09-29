import { ensureCsrfCookie, sessionHttp as http } from './http';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, AuthUser, LoginCredentials, RegisterData } from '../types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    await ensureCsrfCookie();
    return (await http.post<AuthResponse>('/login', credentials)).data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
    await ensureCsrfCookie();
    return (await http.post<AuthResponse>('/register', data)).data;
}

export async function logout(): Promise<void> {
    await http.post('/logout');
}

export async function me(signal?: AbortSignal): Promise<AuthUser> {
    return (await http.get<ApiResponse<AuthUser>>('/me', { signal })).data.data;
}
