/** Claves de caché de React Query de toda la aplicación. */
export const queryKeys = {
    session: ['auth', 'me'] as const,
    publicProperties: ['properties', 'public'] as const,
    publicProperty: (uuid: string) => ['properties', 'public', uuid] as const,
    hostProperties: ['host', 'properties'] as const,
    hostPropertyList: (page: number) => ['host', 'properties', page] as const,
    hostProperty: (uuid: string) => ['host', 'property', uuid] as const,
    propertyImages: (propertyId: number) => ['host', 'property', propertyId, 'images'] as const,
    propertyPanoramas: (propertyId: number) => ['host', 'property', propertyId, 'panoramas'] as const,
    departments: ['locations', 'departments'] as const,
    cities: (departmentId: string) => ['locations', 'cities', departmentId] as const,
    amenities: ['amenities'] as const,
    guestReservations: ['guest', 'reservations'] as const,
    guestReservationList: (page: number) => ['guest', 'reservations', page] as const,
};
