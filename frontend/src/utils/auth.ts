import { paths } from '../routes/paths';
import type { AuthUser, UserRole } from '../types/auth';

export const hasRole = (user: AuthUser | null, role: UserRole) =>
    user?.roles.some((item) => item.name === role) ?? false;

/** Pantalla inicial de cada rol; un anfitrión recién registrado va directo a crear su alojamiento. */
export const dashboardPath = (user: AuthUser, afterRegister: boolean) =>
    hasRole(user, 'ANFITRION') ? (afterRegister ? paths.hostSetup : paths.host) : paths.guest;
