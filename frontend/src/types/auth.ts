import type { FormEvent } from 'react';
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

export interface MfaChallenge {
    status: 'mfa_required';
    challenge_id: string;
    method: 'email';
    masked_email: string;
    expires_at: string;
    resend_after: number;
}

export type AuthChallengeResponse = ApiResponse<MfaChallenge>;

export interface MfaVerification {
    challenge_id: string;
    code: string;
}

export interface MfaChallengeFormProps {
    challenge: MfaChallenge;
    code: string;
    codeError?: string;
    formError: string;
    notice: string;
    expiresIn: number;
    resendIn: number;
    pending: boolean;
    verifying: boolean;
    resending: boolean;
    canceling: boolean;
    blocked: boolean;
    accountCreated: boolean;
    onCodeChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onResend: () => void;
    onCancel: () => void;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
    resend_after: number;
}

export interface ResetPasswordData {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export type AuthFormPhase =
    | { step: 'credentials' }
    | { step: 'mfa'; challenge: MfaChallenge; resendAvailableAt: number };

export interface AuthSession {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
}

export type AuthField = 'name' | 'email' | 'password' | 'password_confirmation' | 'role' | 'code';
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
