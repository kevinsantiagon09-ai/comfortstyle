import { BadgeDollarSign, Camera, House, MapPin, Sparkles, type LucideIcon } from 'lucide-react';

/** Pasos del registro de un alojamiento, en orden. */
export const setupSteps: { label: string; icon: LucideIcon }[] = [
    { label: 'Tu alojamiento', icon: House },
    { label: 'Ubicación', icon: MapPin },
    { label: 'Capacidad y precio', icon: BadgeDollarSign },
    { label: 'Fotografías', icon: Camera },
    { label: 'Comodidades', icon: Sparkles },
];
