"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const audit_service_1 = require("./audit.service");
const stripe_1 = __importDefault(require("stripe"));
class StoreService {
    /**
     * Valida se a organização pode usar a loja (Gating de Plano).
     */
    static async validatePlan(orgId) {
        const org = await prisma_1.default.organization.findUnique({
            where: { id: orgId },
            select: { plan: true },
        });
        if (!org)
            throw new Error('Organização não encontrada.');
        // Regra de Gating: Planos FREE não podem ter loja
        if (org.plan === 'FREE') {
            throw new Error('PLAN_UPGRADE_REQUIRED:STORE');
        }
        return org;
    }
    /**
     * Recupera as configurações da loja da org. Cria se não existir.
     */
    static async getStoreSettings(orgId) {
        let settings = await prisma_1.default.storeSettings.findUnique({
            where: { organizationId: orgId },
        });
        if (!settings) {
            settings = await prisma_1.default.storeSettings.create({
                data: { organizationId: orgId },
            });
        }
        return settings;
    }
    /**
     * Atualiza configurações da loja.
     */
    static async updateStoreSettings(orgId, data, userId) {
        await this.validatePlan(orgId);
        const settings = await prisma_1.default.storeSettings.upsert({
            where: { organizationId: orgId },
            update: {
                enabled: data.enabled !== undefined ? data.enabled : undefined,
                currency: data.currency,
                checkoutProvider: data.checkoutProvider,
                config: data.config ? (typeof data.config === 'string' ? data.config : JSON.stringify(data.config)) : undefined,
            },
            create: {
                organizationId: orgId,
                enabled: data.enabled ?? false,
                currency: data.currency || "BRL",
                checkoutProvider: data.checkoutProvider || "STRIPE",
                config: data.config ? (typeof data.config === 'string' ? data.config : JSON.stringify(data.config)) : undefined,
            }
        });
        await audit_service_1.auditService.log({
            organizationId: orgId,
            userId,
            action: 'STORE_SETTINGS_UPDATED',
            resourceType: 'StoreSettings',
            resourceId: settings.id,
            metadata: data,
        });
        return settings;
    }
    /**
     * Lista produtos do tenant
     */
    static async listProducts(orgId) {
        return prisma_1.default.storeProduct.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Lista produtos (Público) (MOCK ORG BY SLUG)
     */
    static async getPublicProducts(slug) {
        // Encontrar organização pelo ID ou futuramente pelo slug
        const products = await prisma_1.default.storeProduct.findMany({
            where: {
                OR: [
                    { organizationId: slug },
                    { slug: slug }
                ],
                status: 'ACTIVE',
                organization: {
                    storeSettings: {
                        enabled: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        return products;
    }
    /**
     * Cria produto
     */
    static async createProduct(orgId, data, userId) {
        await this.validatePlan(orgId);
        const product = await prisma_1.default.storeProduct.create({
            data: {
                organizationId: orgId,
                slug: data.slug || `product-${Date.now()}`,
                name: data.name,
                description: data.description,
                priceCents: data.priceCents,
                billingCycle: data.billingCycle || 'ONE_TIME',
                status: data.status || 'ACTIVE',
                category: data.category,
                tags: data.tags ? (typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags)) : undefined,
                thumbnailUrl: data.thumbnailUrl,
                deliveryType: data.deliveryType || 'MANUAL',
                deliveryConfig: data.deliveryConfig ? (typeof data.deliveryConfig === 'string' ? data.deliveryConfig : JSON.stringify(data.deliveryConfig)) : undefined,
            }
        });
        await audit_service_1.auditService.log({
            organizationId: orgId,
            userId,
            action: 'STORE_PRODUCT_CREATED',
            resourceType: 'StoreProduct',
            resourceId: product.id,
        });
        return product;
    }
    /**
     * Update produto
     */
    static async updateProduct(orgId, productId, data, userId) {
        await this.validatePlan(orgId);
        const product = await prisma_1.default.storeProduct.update({
            where: { id: productId, organizationId: orgId },
            data: {
                name: data.name,
                description: data.description,
                priceCents: data.priceCents,
                billingCycle: data.billingCycle,
                status: data.status,
                category: data.category,
                tags: data.tags ? (typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags)) : undefined,
                thumbnailUrl: data.thumbnailUrl,
                deliveryType: data.deliveryType,
                deliveryConfig: data.deliveryConfig ? (typeof data.deliveryConfig === 'string' ? data.deliveryConfig : JSON.stringify(data.deliveryConfig)) : undefined,
            }
        });
        await audit_service_1.auditService.log({
            organizationId: orgId,
            userId,
            action: 'STORE_PRODUCT_UPDATED',
            resourceType: 'StoreProduct',
            resourceId: product.id,
        });
        return product;
    }
    /**
     * Delete produto
     */
    static async deleteProduct(orgId, productId, userId) {
        await this.validatePlan(orgId);
        const product = await prisma_1.default.storeProduct.delete({
            where: { id: productId, organizationId: orgId }
        });
        await audit_service_1.auditService.log({
            organizationId: orgId,
            userId,
            action: 'STORE_PRODUCT_DELETED',
            resourceType: 'StoreProduct',
            resourceId: product.id,
        });
        return product;
    }
    /**
     * Retorna orders do Tenant
     */
    static async listOrders(orgId) {
        return prisma_1.default.storeOrder.findMany({
            where: { organizationId: orgId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    /**
     * Checkout de um pedido usando Stripe Real.
     */
    static async createCheckoutSession(orgId, data) {
        const settings = await this.getStoreSettings(orgId);
        const config = settings.config ? JSON.parse(settings.config) : {};
        const stripeSecretKey = config.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
        const successUrl = config.successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/store/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = config.cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3001'}/store/cancel`;
        if (!stripeSecretKey) {
            throw new Error('CONFIG_REQUIRED:STRIPE_KEY');
        }
        const stripe = new stripe_1.default(stripeSecretKey, {
            apiVersion: '2025-01-27.acacia',
        });
        // 1. Criar o Pedido no Banco (PENDING)
        const totalCents = data.items.reduce((acc, item) => acc + (item.priceCents * item.quantity), 0);
        const order = await prisma_1.default.storeOrder.create({
            data: {
                organizationId: orgId,
                externalCustomerId: data.externalCustomerId,
                paymentProvider: 'STRIPE',
                status: 'PENDING',
                totalCents,
                currency: settings.currency || 'BRL',
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPriceCents: item.priceCents,
                        totalCents: item.priceCents * item.quantity,
                    }))
                }
            }
        });
        // 2. Criar a sessão no Stripe
        const lineItems = data.items.map((item) => ({
            price_data: {
                currency: settings.currency.toLowerCase() || 'brl',
                product_data: {
                    name: item.name || 'Produto OrbitOS',
                    description: item.description,
                    metadata: { productId: item.productId }
                },
                unit_amount: item.priceCents,
                // Assinatura se o produto tiver billingCycle != ONE_TIME
                recurring: item.billingCycle && item.billingCycle !== 'ONE_TIME' ? {
                    interval: item.billingCycle === 'MONTHLY' ? 'month' : 'year'
                } : undefined,
            },
            quantity: item.quantity,
        }));
        const isSubscription = data.items.some((i) => i.billingCycle && i.billingCycle !== 'ONE_TIME');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: isSubscription ? 'subscription' : 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderId: order.id,
                organizationId: orgId,
                externalCustomerId: data.externalCustomerId || ''
            }
        });
        // 3. Atualizar o pedido com o ID da Sessão
        await prisma_1.default.storeOrder.update({
            where: { id: order.id },
            data: { paymentIntentId: session.id }
        });
        return {
            orderId: order.id,
            checkoutUrl: session.url,
        };
    }
}
exports.StoreService = StoreService;
