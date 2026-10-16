import { ROLE_MODES } from '../../constants/roleModes';
import { currentRole } from '../../utils/auth';
import { useAuth } from '../auth/session/useAuth';

/** Rol con el que navega el usuario (anfitrión o huésped) y cómo se presenta; nulo para visitantes. */
export function useRoleMode() {
    const { user } = useAuth();
    const role = currentRole(user);

    return { user, role, mode: role ? ROLE_MODES[role] : null };
}
