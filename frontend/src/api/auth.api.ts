import { sessionHttp as http } from './http';
import type {
    AuthResponse,
    AuthUser,
    LoginCredentials,
    RegisterData,
} from '../types/auth';

export async function login(
    credentials: LoginCredentials
): Promise<AuthResponse> {
    await http.get('/sanctum/csrf-cookie');
    const response = await http.post<AuthResponse>(
        '/login',
        credentials
    );

    return response.data;
}

export async function register(
    data: RegisterData
): Promise<AuthResponse> {
    await http.get('/sanctum/csrf-cookie');
    const response = await http.post<AuthResponse>(
        '/register',
        data
    );

    return response.data;
}

export async function logout(): Promise<void> {
    await http.post('/logout');
}
export async function me(): Promise<AuthUser> {
    const response = await http.get<{ data: AuthUser }>('/me');
    return response.data.data;
}
