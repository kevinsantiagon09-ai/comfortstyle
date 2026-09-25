import axios from 'axios';

export const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const backendUrl = apiUrl.replace(/\/api$/, '');
const options = {
    withCredentials: true,
    withXSRFToken: true,
    headers: { Accept: 'application/json' },
};
const http = axios.create({ ...options, baseURL: apiUrl });
export const sessionHttp = axios.create({ ...options, baseURL: import.meta.env.VITE_AUTH_URL || backendUrl || '/' });
export default http;
