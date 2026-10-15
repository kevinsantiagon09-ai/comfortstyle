import { isAxiosError } from 'axios';
import { ensureCsrfCookie, sessionHttp as http } from '../http';
import type { ApiResponse } from '../../types/api';
import type { AuthChallengeResponse, AuthResponse, AuthUser, ForgotPasswordData, ForgotPasswordResponse, LoginCredentials, MfaVerification, RegisterData, ResetPasswordData, ResetPasswordResponse } from '../../types/auth';

/** Renueva CSRF y repite una sola vez cuando la cookie ya no es válida. */
async function postWithCsrfRetry<T>(path: string, data?: unknown): Promise<T> {
    try {
        return (await http.post<T>(path, data)).data;
    } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 419) throw error;
        await ensureCsrfCookie();
        return (await http.post<T>(path, data)).data;
    }
}

export async function login(credentials: LoginCredentials): Promise<AuthChallengeResponse> {
    await ensureCsrfCookie();
    return postWithCsrfRetry<AuthChallengeResponse>('/login', credentials);
}

export async function register(data: RegisterData): Promise<AuthChallengeResponse> {
    await ensureCsrfCookie();
    return postWithCsrfRetry<AuthChallengeResponse>('/register', data);
}

export async function verifyMfa(data: MfaVerification): Promise<AuthResponse> {
    return postWithCsrfRetry<AuthResponse>('/mfa/verify', data);
}

export async function resendMfa(challengeId: string): Promise<AuthChallengeResponse> {
    return postWithCsrfRetry<AuthChallengeResponse>('/mfa/resend', { challenge_id: challengeId });
}

export async function cancelMfa(challengeId: string): Promise<void> {
    await postWithCsrfRetry('/mfa/cancel', { challenge_id: challengeId });
}

export async function forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
    await ensureCsrfCookie();
    return postWithCsrfRetry<ForgotPasswordResponse>('/forgot-password', data);
}

export async function resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    await ensureCsrfCookie();
    return postWithCsrfRetry<ResetPasswordResponse>('/reset-password', data);
}

export async function logout(): Promise<void> {
    await postWithCsrfRetry('/logout');
}

export async function me(signal?: AbortSignal): Promise<AuthUser> {
    return (await http.get<ApiResponse<AuthUser>>('/me', { signal })).data.data;
}
