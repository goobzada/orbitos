import { Request, Response } from 'express';
import { StoreService } from '../services/domain/store.service';
import { StoreDomainService } from '../services/domain/store-domain.service';
import prisma from '../lib/prisma';

export class StoreController {

    // --- DOMAINS ---
    static async listDomains(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const result = await StoreDomainService.listDomains(organizationId);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async addDomain(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const { domain } = req.body;
            const result = await StoreDomainService.addDomain(organizationId, domain);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async verifyDomain(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const domainId = req.params.domainId as string;
            const result = await StoreDomainService.verifyDomain(organizationId, domainId);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async setPrimaryDomain(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const domainId = req.params.domainId as string;
            const result = await StoreDomainService.setPrimaryDomain(organizationId, domainId);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async deleteDomain(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const domainId = req.params.domainId as string;
            const result = await StoreDomainService.deleteDomain(organizationId, domainId);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // --- SETTINGS ---
    static async getSettings(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const settings = await StoreService.getStoreSettings(organizationId);
            return res.json(settings);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateSettings(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const userId = req.user!.id;
            const data = req.body;
            const settings = await StoreService.updateStoreSettings(organizationId, data, userId);
            return res.json(settings);
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    // --- PRODUCTS ---
    static async listProducts(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const products = await StoreService.listProducts(organizationId);
            return res.json(products);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async createProduct(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const userId = req.user!.id;
            const data = req.body;
            const product = await StoreService.createProduct(organizationId, data, userId);
            return res.status(201).json(product);
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateProduct(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const productId = req.params.id as string;
            const userId = req.user!.id;
            const data = req.body;
            const product = await StoreService.updateProduct(organizationId, productId, data, userId);
            return res.json(product);
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    static async deleteProduct(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const productId = req.params.id as string;
            const userId = req.user!.id;
            const product = await StoreService.deleteProduct(organizationId, productId, userId);
            return res.json({ success: true, product });
        } catch (error: any) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }

    // --- ORDERS ---
    static async listOrders(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const orders = await StoreService.listOrders(organizationId);
            return res.json(orders);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async deliverOrder(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const orderId = req.params.id as string;
            const userId = req.user!.id;
            const result = await StoreService.deliverOrder(organizationId, orderId, userId);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    // --- PUBLIC ENDPOINTS ---
    static async getPublicProducts(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const products = await StoreService.getPublicProducts(slug);
            return res.json(products);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async checkoutPublic(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const data = req.body;
            const checkout = await StoreService.createCheckoutSession(slug, data);
            return res.status(201).json(checkout);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Endpoint de verificação para o Caddy on-demand TLS.
     * Caddy chama GET /public/store/domain/verify?domain=loja.cliente.com antes de emitir o certificado.
     * Retorna 200 se o domínio está cadastrado e ativo, 404 caso contrário.
     */
    static async verifyDomainForCaddy(req: Request, res: Response) {
        const domain = (req.query.domain as string || '').toLowerCase().trim();
        if (!domain) {
            return res.status(400).end();
        }
        try {
            const found = await (prisma as any).storeDomain.findFirst({
                where: { domain, status: 'active' },
                select: { id: true },
            });
            return found ? res.status(200).end() : res.status(404).end();
        } catch {
            return res.status(500).end();
        }
    }

    static async resolveStoreByHost(req: Request, res: Response) {
        try {
            const hostInput = (req.query.host as string) || req.headers.host || '';
            if (!hostInput) {
                return res.status(400).json({ error: 'Host obrigatório.' });
            }

            const result = await StoreDomainService.resolveStoreByHost(hostInput);
            if (!result) {
                return res.status(404).json({ error: 'Store não encontrada para host informado.' });
            }

            const requestedPath = (req.query.path as string) || '/';

            console.log('[STORE_RESOLVE]', {
                host: hostInput,
                storeId: result.store.id,
                tenantId: result.organization.id,
                path: requestedPath,
                status: 200,
            });

            return res.json({
                store: {
                    id: result.store.id,
                    slug: result.store.slug,
                    name: result.store.name,
                    primaryDomain: result.store.primaryDomain,
                },
                organization: {
                    id: result.organization.id,
                    name: result.organization.name,
                    slug: result.organization.slug,
                },
                canonicalRedirectTo: result.canonicalRedirectTo,
            });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
