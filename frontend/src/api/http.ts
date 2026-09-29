import axios from 'axios';

export const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const backendUrl = apiUrl.replace(/\/api$/, '');
const options = {
    withCredentials: true,
    withXSRFToken: true,
    headers: { Accept: 'application/json' },
};
const http = axios.create({ ...options, baseURL: apiUrl });
export const sessionHttp = axios.create({ ...options, baseURL: import.meta.env.VITE_AUTH_URL || backendUrl || (import.meta.env.DEV ? '/backend' : '/') });

/** Sanctum exige la cookie CSRF antes de cualquier petición que modifique datos. */
export async function ensureCsrfCookie() {
    await sessionHttp.get('/sanctum/csrf-cookie');
}

export default http;
