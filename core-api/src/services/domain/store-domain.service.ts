import dns from 'dns/promises';
import prisma from '../../lib/prisma';
import {
    APP_DOMAIN,
    RESERVED_DOMAINS,
    RESERVED_SLUGS,
    ROOT_DOMAIN,
    STORES_GATEWAY_DOMAIN,
} from '../../constants/store-domains';
import { extractSlugFromHost, normalizeDomain } from '../../utils/domain.utils';

const db = prisma as any;

type ResolveResult = {
    store: any;
    organization: any;
    canonicalRedirectTo: string | null;
};

export class StoreDomainService {
    private static async ensureStoreForOrg(orgId: string) {
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { id: true, name: true, slug: true },
        });

        if (!org) throw new Error('Organização não encontrada.');

        let desiredSlug = (org.slug || '').toLowerCase();
        if (!desiredSlug || RESERVED_SLUGS.has(desiredSlug)) {
            desiredSlug = `store-${org.id.slice(0, 8)}`;
        }

        let slug = desiredSlug;
        let attempts = 0;
        while (attempts < 5) {
            const existing = await db.store.findFirst({ where: { slug } });
            if (!existing || existing.orgId === org.id) break;
            attempts += 1;
            slug = `${desiredSlug}-${attempts}`;
        }

        const store = await db.store.upsert({
            where: { orgId: org.id },
            update: {
                name: org.name,
                slug,
            },
            create: {
                orgId: org.id,
                name: org.name,
                slug,
            },
        });

        const defaultDomain = `${store.slug}.${ROOT_DOMAIN}`;

        await db.storeDomain.upsert({
            where: { domain: defaultDomain },
            update: {
                orgId: org.id,
                storeId: store.id,
                type: 'default',
                status: 'active',
                isPrimary: !store.primaryDomain,
                verifiedAt: new Date(),
            },
            create: {
                orgId: org.id,
                storeId: store.id,
                domain: defaultDomain,
                type: 'default',
                status: 'active',
                isPrimary: !store.primaryDomain,
                verifiedAt: new Date(),
            },
        });

        return { store, org, defaultDomain };
    }

    static async listDomains(orgId: string) {
        const { store, defaultDomain } = await this.ensureStoreForOrg(orgId);
        const domains = await db.storeDomain.findMany({
            where: { storeId: store.id },
            orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
        });

        return {
            store,
            defaultDomain,
            domains,
        };
    }

    static async addDomain(orgId: string, inputDomain: string) {
        const { store } = await this.ensureStoreForOrg(orgId);
        const domain = normalizeDomain(inputDomain);

        if (RESERVED_DOMAINS.has(domain)) {
            throw new Error('Domínio reservado pelo sistema.');
        }

        const slugHost = `${store.slug}.${ROOT_DOMAIN}`;
        if (domain === slugHost) {
            throw new Error('Este domínio já é o domínio padrão da loja.');
        }

        const existing = await db.storeDomain.findUnique({ where: { domain } });
        if (existing) {
            throw new Error('Domínio já cadastrado.');
        }

        const verificationToken = `orbic-${Math.random().toString(36).slice(2, 12)}`;
        const record = await db.storeDomain.create({
            data: {
                orgId,
                storeId: store.id,
                domain,
                type: 'custom',
                status: 'pending',
                verificationToken,
                isPrimary: false,
            },
        });

        return {
            domain: record,
            dnsInstructions: {
                cname: {
                    host: domain,
                    value: STORES_GATEWAY_DOMAIN,
                },
                txt: {
                    host: `_orbic.${domain}`,
                    value: `orbic-verify=${verificationToken}`,
                },
            },
        };
    }

    static async verifyDomain(orgId: string, domainId: string) {
        const domain = await db.storeDomain.findFirst({
            where: { id: domainId, orgId },
        });

        if (!domain) throw new Error('Domínio não encontrado.');
        if (domain.type === 'default') {
            return { domain, verification: { cnameOk: true, txtOk: true } };
        }

        let cnameOk = false;
        let txtOk = false;

        try {
            const cnameRecords = await dns.resolveCname(domain.domain);
            cnameOk = cnameRecords.some((value) => normalizeDomain(value) === STORES_GATEWAY_DOMAIN);
        } catch {
            cnameOk = false;
        }

        if (domain.verificationToken) {
            try {
                const txtRecords = await dns.resolveTxt(`_orbic.${domain.domain}`);
                const flat = txtRecords.flat().join(' ');
                txtOk = flat.includes(`orbic-verify=${domain.verificationToken}`);
            } catch {
                txtOk = false;
            }
        }

        const verified = cnameOk || txtOk;

        const updated = await db.storeDomain.update({
            where: { id: domain.id },
            data: {
                status: verified ? 'verified' : 'error',
                verifiedAt: verified ? new Date() : null,
            },
        });

        return {
            domain: updated,
            verification: { cnameOk, txtOk, verified },
        };
    }

    static async setPrimaryDomain(orgId: string, domainId: string) {
        const domain = await db.storeDomain.findFirst({
            where: { id: domainId, orgId },
            include: { store: true },
        });

        if (!domain) throw new Error('Domínio não encontrado.');
        if (!['verified', 'active'].includes(domain.status) && domain.type !== 'default') {
            throw new Error('Domínio precisa estar verificado para virar primário.');
        }

        await prisma.$transaction([
            db.storeDomain.updateMany({
                where: { storeId: domain.storeId },
                data: { isPrimary: false },
            }),
            db.storeDomain.update({
                where: { id: domain.id },
                data: { isPrimary: true, status: domain.type === 'default' ? 'active' : 'active' },
            }),
            db.store.update({
                where: { id: domain.storeId },
                data: {
                    primaryDomain: domain.type === 'default' ? null : domain.domain,
                },
            }),
        ]);

        return { success: true, domain: domain.domain };
    }

    static async deleteDomain(orgId: string, domainId: string) {
        const domain = await db.storeDomain.findFirst({
            where: { id: domainId, orgId },
            include: { store: true },
        });

        if (!domain) throw new Error('Domínio não encontrado.');
        if (domain.type === 'default') {
            throw new Error('Domínio padrão não pode ser removido.');
        }

        await prisma.$transaction(async (tx) => {
            const txAny = tx as any;
            await txAny.storeDomain.delete({ where: { id: domain.id } });

            if (domain.isPrimary) {
                await txAny.store.update({
                    where: { id: domain.storeId },
                    data: { primaryDomain: null },
                });

                const fallbackDefault = await txAny.storeDomain.findFirst({
                    where: { storeId: domain.storeId, type: 'default' },
                });

                if (fallbackDefault) {
                    await txAny.storeDomain.update({
                        where: { id: fallbackDefault.id },
                        data: { isPrimary: true, status: 'active' },
                    });
                }
            }
        });

        return { success: true };
    }

    static async resolveStoreByHost(hostInput: string): Promise<ResolveResult | null> {
        const host = normalizeDomain(hostInput);

        // 1) Custom domain match first
        const customDomain = await db.storeDomain.findFirst({
            where: {
                domain: host,
                type: 'custom',
                status: { in: ['verified', 'active'] },
            },
            include: {
                store: true,
                organization: true,
            },
        });

        if (customDomain) {
            return {
                store: customDomain.store,
                organization: customDomain.organization,
                canonicalRedirectTo: null,
            };
        }

        // 2) Legacy org customDomain fallback (if still used)
        const orgByLegacyCustom = await prisma.organization.findFirst({
            where: { customDomain: host },
        });

        if (orgByLegacyCustom) {
            const store = await this.ensureStoreForOrg(orgByLegacyCustom.id);
            return {
                store: store.store,
                organization: orgByLegacyCustom,
                canonicalRedirectTo: null,
            };
        }

        // 3) orbic subdomain fallback (slug.orbicapp.com)
        const slug = extractSlugFromHost(host);
        if (!slug || RESERVED_SLUGS.has(slug) || host === APP_DOMAIN || host === STORES_GATEWAY_DOMAIN) {
            return null;
        }

        const store = await db.store.findFirst({
            where: { slug, status: 'active' },
            include: { organization: true },
        });

        if (!store) return null;

        const canonicalRedirectTo = store.primaryDomain ? normalizeDomain(store.primaryDomain) : null;

        return {
            store,
            organization: (store as any).organization,
            canonicalRedirectTo,
        };
    }
}
