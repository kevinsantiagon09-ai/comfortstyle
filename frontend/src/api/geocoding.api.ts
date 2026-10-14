import axios from 'axios';
import { GEOCODER_URL } from '../constants/map';
import type { MapPoint } from '../types/map';

/** Centro aproximado de un lugar escrito (por ejemplo «Armenia, Quindío») usando Nominatim de OpenStreetMap. */
export async function geocodePlace(place: string, signal?: AbortSignal): Promise<MapPoint | null> {
    const { data } = await axios.get<{ lat: string; lon: string }[]>(GEOCODER_URL, {
        params: { q: place, format: 'jsonv2', limit: 1, countrycodes: 'co', 'accept-language': 'es' },
        signal,
    });
    return data[0] ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null;
}
