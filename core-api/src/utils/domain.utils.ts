import { ROOT_DOMAIN } from '../constants/store-domains';

export function normalizeDomain(input: string): string {
    const raw = (input || '').trim().toLowerCase();
    if (!raw) throw new Error('Domínio inválido.');

    const withoutProtocol = raw.replace(/^https?:\/\//, '');
    const withoutPath = withoutProtocol.split('/')[0];
    const withoutPort = withoutPath.split(':')[0];
    const normalized = withoutPort.replace(/\.$/, '');

    if (!normalized || normalized.includes('..') || !/^[a-z0-9.-]+$/.test(normalized)) {
        throw new Error('Domínio inválido.');
    }

    // Very basic hostname validation; DNS verification is done separately.
    if (!normalized.includes('.') || normalized.length > 253) {
        throw new Error('Domínio inválido.');
    }

    return normalized;
}

export function extractSlugFromHost(host: string): string | null {
    const normalized = normalizeDomain(host);
    const suffix = `.${ROOT_DOMAIN}`;

    if (!normalized.endsWith(suffix)) return null;

    const slug = normalized.slice(0, -suffix.length);
    if (!slug || slug.includes('.')) return null;

    return slug;
}
