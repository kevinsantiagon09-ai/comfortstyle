/** Rutas de la aplicación. Usa siempre estas constantes en lugar de escribir las URL. */
export const paths = {
    home: '/',
    login: '/login',
    register: '/register',
    guest: '/guest',
    host: '/host',
    hostSetup: '/host/setup',
    hostPropertyEdit: '/host/properties/:id/edit',
    propertyDetail: '/properties/:id',
} as const;

export const propertyDetailPath = (id: number) => `/properties/${id}`;

export const hostPropertyEditPath = (id: number) => `/host/properties/${id}/edit`;

/** El registro abre el paso de fotografías cuando recibe el alojamiento en `?property=`. */
export const hostPropertyPhotosPath = (id: number) => `${paths.hostSetup}?property=${id}`;
