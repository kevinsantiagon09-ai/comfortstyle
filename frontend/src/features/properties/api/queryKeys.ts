export const propertyKeys = {
    hostAll: ['host', 'properties'] as const,
    hostList: (page: number) => ['host', 'properties', page] as const,
    hostDetail: (id: number) => ['host', 'property', id] as const,
    images: (id: number) => ['host', 'property', id, 'images'] as const,
};
