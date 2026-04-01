"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const store_service_1 = require("../services/domain/store.service");
const store_domain_service_1 = require("../services/domain/store-domain.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
class StoreController {
    // --- DOMAINS ---
    static async listDomains(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const result = await store_domain_service_1.StoreDomainService.listDomains(organizationId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async addDomain(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const { domain } = req.body;
            const result = await store_domain_service_1.StoreDomainService.addDomain(organizationId, domain);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async verifyDomain(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const domainId = req.params.domainId;
            const result = await store_domain_service_1.StoreDomainService.verifyDomain(organizationId, domainId);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async setPrimaryDomain(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const domainId = req.params.domainId;
            const result = await store_domain_service_1.StoreDomainService.setPrimaryDomain(organizationId, domainId);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async deleteDomain(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const domainId = req.params.domainId;
            const result = await store_domain_service_1.StoreDomainService.deleteDomain(organizationId, domainId);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    // --- SETTINGS ---
    static async getSettings(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const settings = await store_service_1.StoreService.getStoreSettings(organizationId);
            return res.json(settings);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async updateSettings(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user.id;
            const data = req.body;
            const settings = await store_service_1.StoreService.updateStoreSettings(organizationId, data, userId);
            return res.json(settings);
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    // --- PRODUCTS ---
    static async listProducts(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const products = await store_service_1.StoreService.listProducts(organizationId);
            return res.json(products);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async createProduct(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user.id;
            const data = req.body;
            const product = await store_service_1.StoreService.createProduct(organizationId, data, userId);
            return res.status(201).json(product);
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    static async updateProduct(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const productId = req.params.id;
            const userId = req.user.id;
            const data = req.body;
            const product = await store_service_1.StoreService.updateProduct(organizationId, productId, data, userId);
            return res.json(product);
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    static async deleteProduct(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const productId = req.params.id;
            const userId = req.user.id;
            const product = await store_service_1.StoreService.deleteProduct(organizationId, productId, userId);
            return res.json({ success: true, product });
        }
        catch (error) {
            if (error.message.includes('PLAN_UPGRADE_REQUIRED')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message });
        }
    }
    // --- ORDERS ---
    static async listOrders(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const orders = await store_service_1.StoreService.listOrders(organizationId);
            return res.json(orders);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async deliverOrder(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const orderId = req.params.id;
            const userId = req.user.id;
            const result = await store_service_1.StoreService.deliverOrder(organizationId, orderId, userId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // --- PUBLIC ENDPOINTS ---
    static async getPublicProducts(req, res) {
        try {
            const slug = req.params.slug;
            const products = await store_service_1.StoreService.getPublicProducts(slug);
            return res.json(products);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async checkoutPublic(req, res) {
        try {
            const slug = req.params.slug;
            const data = req.body;
            const checkout = await store_service_1.StoreService.createCheckoutSession(slug, data);
            return res.status(201).json(checkout);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Endpoint de verificação para o Caddy on-demand TLS.
     * Caddy chama GET /public/store/domain/verify?domain=loja.cliente.com antes de emitir o certificado.
     * Retorna 200 se o domínio está cadastrado e ativo, 404 caso contrário.
     */
    static async verifyDomainForCaddy(req, res) {
        const domain = (req.query.domain || '').toLowerCase().trim();
        if (!domain) {
            return res.status(400).end();
        }
        try {
            // Verifica o domínio exato ou a variante www (para apex domains)
            const wwwVariant = domain.startsWith('www.') ? domain : `www.${domain}`;
            const found = await prisma_1.default.storeDomain.findFirst({
                where: {
                    domain: { in: [domain, wwwVariant] },
                    status: 'active',
                },
                select: { id: true },
            });
            return found ? res.status(200).end() : res.status(404).end();
        }
        catch {
            return res.status(500).end();
        }
    }
    static async resolveStoreByHost(req, res) {
        try {
            const hostInput = req.query.host || req.headers.host || '';
            if (!hostInput) {
                return res.status(400).json({ error: 'Host obrigatório.' });
            }
            const result = await store_domain_service_1.StoreDomainService.resolveStoreByHost(hostInput);
            if (!result) {
                return res.status(404).json({ error: 'Store não encontrada para host informado.' });
            }
            const requestedPath = req.query.path || '/';
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
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.StoreController = StoreController;
