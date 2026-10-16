import { Compass, KeyRound } from 'lucide-react';
import { paths } from '../routes/paths';
import type { UserRole } from '../types/auth';
import type { RoleMode } from '../types/roleMode';

export const ROLE_MODES: Record<UserRole, RoleMode> = {
    ANFITRION: {
        name: 'Anfitrión',
        icon: KeyRound,
        gradient: 'from-teal-500 to-emerald-500',
        greeting: 'Tus espacios están listos para recibir huéspedes.',
        tagline: 'Publica, ajusta precios y entérate al instante de cada reserva.',
        dashboard: paths.host,
        dashboardLabel: 'Ir a mi estudio',
    },
    HUESPED: {
        name: 'Huésped',
        icon: Compass,
        gradient: 'from-sky-500 to-cyan-500',
        greeting: '¿A dónde te lleva el próximo viaje?',
        tagline: 'Descubre hospedajes con estilo, reserva en segundos y lleva tus viajes en un solo lugar.',
        dashboard: paths.guest,
        dashboardLabel: 'Mis viajes',
    },
};
