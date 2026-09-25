import { backendUrl } from '../api/http';
export const fallbackImage = `${import.meta.env.BASE_URL}property-placeholder.svg`;
export function propertyImageUrl(path?: string | null): string {
    if (!path?.trim()) return fallbackImage;
    const cleanPath = path.trim();
    if (/^https?:\/\//i.test(cleanPath)) return cleanPath;
    const storageUrl = (import.meta.env.VITE_STORAGE_URL || `${backendUrl}/storage`).replace(/\/+$/, '');
    return `${storageUrl}/${cleanPath.replace(/^\/+/, '').replace(/^storage\//, '')}`;
}
