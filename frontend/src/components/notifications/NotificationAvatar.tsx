import { NOTIFICATION_KINDS } from '../../constants/notifications';
import type { NotificationAvatarProps } from '../../types/notification';
import { propertyImageUrl } from '../../utils/imageUrl';

/** Foto del alojamiento con un distintivo de color según el tipo de aviso, al estilo de las redes sociales. */
export default function NotificationAvatar({ notification, size = 'md' }: NotificationAvatarProps) {
    const { icon: Icon, badgeClass } = NOTIFICATION_KINDS[notification.kind];
    const box = size === 'lg' ? 'h-14 w-14' : 'h-12 w-12';

    return <span className={`relative shrink-0 ${box}`}>
        {notification.cover_path
            ? <img src={propertyImageUrl(notification.cover_path)} alt="" className={`${box} rounded-full object-cover ring-1 ring-slate-200`} />
            : <span className={`${box} grid place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white`}>{notification.actor_name.charAt(0).toUpperCase()}</span>}
        <span className={`absolute -right-1 -bottom-1 grid h-6 w-6 place-items-center rounded-full text-white ring-2 ring-white ${badgeClass}`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
    </span>;
}
