import { BedDouble, Bike, CarFront, ChefHat, Flower2, LayoutGrid, Map, Sparkles } from 'lucide-react';
import type { HomeCategory, UpcomingService } from '../types/home';

export const HOME_CATEGORIES: HomeCategory[] = [
    { id: 'todo', label: 'Todo', description: 'Lo mejor de ComfortStyle', icon: LayoutGrid },
    { id: 'hospedajes', label: 'Hospedajes', description: 'Casas, cabañas, fincas y más', icon: BedDouble },
    { id: 'servicios', label: 'Servicios', description: 'Experiencias y extras para tu viaje', icon: Sparkles, soon: true },
];

export const DEFAULT_HOME_CATEGORY = 'todo';

/** Alojamientos que se muestran en "Todo" antes del enlace "Ver todos". */
export const HOME_PREVIEW_LIMIT = 8;

export const UPCOMING_SERVICES: UpcomingService[] = [
    { title: 'Experiencias locales', description: 'Tours y planes guiados por anfitriones de la zona.', icon: Map, accent: 'bg-amber-100 text-amber-700' },
    { title: 'Chef a domicilio', description: 'Cocina regional preparada en tu alojamiento.', icon: ChefHat, accent: 'bg-rose-100 text-rose-700' },
    { title: 'Traslados', description: 'Del aeropuerto o la terminal hasta la puerta.', icon: CarFront, accent: 'bg-sky-100 text-sky-700' },
    { title: 'Bienestar', description: 'Masajes, yoga y spa sin salir de tu estadía.', icon: Flower2, accent: 'bg-emerald-100 text-emerald-700' },
    { title: 'Aventura', description: 'Bicicletas, kayak y deportes al aire libre.', icon: Bike, accent: 'bg-violet-100 text-violet-700' },
];
