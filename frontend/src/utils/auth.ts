import { paths } from '../routes/paths';
import type { AuthUser, UserRole } from '../types/auth';

export const hasRole = (user: AuthUser | null, role: UserRole) =>
    user?.roles.some((item) => item.name === role) ?? false;

/** Pantalla inicial de cada rol; un anfitrión recién registrado va directo a crear su alojamiento. */
export const dashboardPath = (user: AuthUser, afterRegister: boolean) =>
    hasRole(user, 'ANFITRION') ? (afterRegister ? paths.hostSetup : paths.host) : paths.guest;

/** Rol con el que el usuario navega la app; nulo si no tiene sesión o no es huésped ni anfitrión. */
export const currentRole = (user: AuthUser | null): UserRole | null =>
    hasRole(user, 'ANFITRION') ? 'ANFITRION' : hasRole(user, 'HUESPED') ? 'HUESPED' : null;
