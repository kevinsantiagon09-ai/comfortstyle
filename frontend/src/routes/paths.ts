/** Rutas de la aplicación. Usa siempre estas constantes en lugar de escribir las URL. */
export const paths = {
    home: '/',
    login: '/login',
    register: '/register',
    guest: '/guest',
    host: '/host',
    hostSetup: '/host/setup',
    hostPropertyEdit: '/host/properties/:uuid/edit',
    propertyDetail: '/properties/:uuid',
} as const;

export const propertyDetailPath = (uuid: string) => `/properties/${uuid}`;

export const hostPropertyEditPath = (uuid: string) => `/host/properties/${uuid}/edit`;

/** El registro abre el paso de fotografías cuando recibe el alojamiento en `?property=`. */
export const hostPropertyPhotosPath = (uuid: string) => `${paths.hostSetup}?property=${uuid}`;
