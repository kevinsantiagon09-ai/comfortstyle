import type { UserRole } from '../../types/auth';
import { hasRole } from '../../utils/auth';
import { useAuth } from './useAuth';

export function useRoleAccess(allowedRole: UserRole) {
    const { user } = useAuth();

    return hasRole(user, allowedRole);
}
