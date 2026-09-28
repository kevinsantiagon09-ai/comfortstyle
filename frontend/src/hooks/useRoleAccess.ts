import type { UserRole } from '../types/auth';
import { useAuth } from './useAuth';

export function useRoleAccess(allowedRole: UserRole) {
    const { user } = useAuth();

    return user?.roles.some((role) => role.name === allowedRole) ?? false;
}
