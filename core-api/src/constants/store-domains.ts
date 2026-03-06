export const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'orbitup.io';
export const APP_DOMAIN = process.env.APP_DOMAIN || `app.${ROOT_DOMAIN}`;
export const STORES_GATEWAY_DOMAIN = process.env.STORES_GATEWAY_DOMAIN || `stores.${ROOT_DOMAIN}`;

export const RESERVED_DOMAINS = new Set([
    ROOT_DOMAIN,
    APP_DOMAIN,
    `api.${ROOT_DOMAIN}`,
    STORES_GATEWAY_DOMAIN,
]);

export const RESERVED_SLUGS = new Set([
    'app',
    'api',
    'admin',
    'stores',
    'www',
    'mail',
    'ftp',
    'dashboard',
]);
