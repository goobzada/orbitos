import prisma from '../../lib/prisma';
import { auditService } from './audit.service';
import Stripe from 'stripe';

export class StoreService {
    /**
     * Valida se a organização pode usar a loja (Gating de Plano).
     */
    static async validatePlan(orgId: string) {
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { plan: true },
        });

        if (!org) throw new Error('Organização não encontrada.');

        // Regra de Gating: Planos FREE não podem ter loja
        if (org.plan === 'FREE') {
            throw new Error('PLAN_UPGRADE_REQUIRED:STORE');
        }

        return org;
    }

    /**
     * Recupera as configurações da loja da org. Cria se não existir.
     */
    static async getStoreSettings(orgId: string) {
        let settings = await prisma.storeSettings.findUnique({
            where: { organizationId: orgId },
        });

        if (!settings) {
            settings = await prisma.storeSettings.create({
                data: { organizationId: orgId },
            });
        }

        return settings;
    }

    /**
     * Atualiza configurações da loja.
     */
    static async updateStoreSettings(orgId: string, data: any, userId: string) {
        await this.validatePlan(orgId);

        const settings = await prisma.storeSettings.upsert({
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

        await auditService.log({
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
    static async listProducts(orgId: string) {
        return prisma.storeProduct.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Lista produtos (Público) — busca por org slug ou UUID
     */
    static async getPublicProducts(slug: string) {
        // Encontrar organização pelo slug ou UUID
        const org = await prisma.organization.findFirst({
            where: {
                OR: [
                    { slug: slug },
                    { subdomain: slug },
                    { id: slug },
                ]
            },
        });

        if (!org) {
            return [];
        }

        return prisma.storeProduct.findMany({
            where: {
                organizationId: org.id,
                status: {
                    in: ['ACTIVE', 'active', 'PUBLISHED', 'published'],
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Cria produto
     */
    static async createProduct(orgId: string, data: any, userId: string) {
        await this.validatePlan(orgId);

        const product = await prisma.storeProduct.create({
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
            } as any
        });

        await auditService.log({
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
    static async updateProduct(orgId: string, productId: string, data: any, userId: string) {
        await this.validatePlan(orgId);

        const product = await prisma.storeProduct.update({
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
            } as any
        });

        await auditService.log({
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
    static async deleteProduct(orgId: string, productId: string, userId: string) {
        await this.validatePlan(orgId);

        const product = await prisma.storeProduct.delete({
            where: { id: productId, organizationId: orgId }
        });

        await auditService.log({
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
    static async listOrders(orgId: string) {
        return prisma.storeOrder.findMany({
            where: { organizationId: orgId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Marca itens de um pedido manual como entregues.
     */
    static async deliverOrder(orgId: string, orderId: string, userId: string) {
        await this.validatePlan(orgId);

        const order = await prisma.storeOrder.findFirst({
            where: { id: orderId, organizationId: orgId },
            include: { items: true }
        });

        if (!order) throw new Error('Pedido n\u00e3o encontrado.');

        await prisma.storeOrderItem.updateMany({
            where: { orderId },
            data: {
                deliveryStatus: 'DELIVERED',
                deliveryLog: `Entregue manualmente em ${new Date().toISOString()}`,
            }
        });

        if (order.status !== 'PAID') {
            await prisma.storeOrder.update({
                where: { id: orderId },
                data: { status: 'PAID', paidAt: new Date() }
            });
        }

        await auditService.log({
            organizationId: orgId,
            userId,
            action: 'ORDER_DELIVERED',
            resourceType: 'StoreOrder',
            resourceId: orderId,
            metadata: { manual: true },
        });

        return { success: true, orderId };
    }

    /**
     * Checkout de um pedido usando Stripe Real.
     */
    static async createCheckoutSession(slugOrId: string, data: any) {
        // Resolve org from slug or UUID
        const org = await prisma.organization.findFirst({
            where: {
                OR: [
                    { slug: slugOrId },
                    { subdomain: slugOrId },
                    { id: slugOrId },
                ]
            },
        });

        if (!org) throw new Error('Organização não encontrada.');

        const orgId = org.id;
        const orgSlug = org.slug || slugOrId;

        const settings = await this.getStoreSettings(orgId);
        const config = settings.config ? JSON.parse(settings.config) : {};

        const stripeSecretKey = config.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3001';
        const successUrl = config.successUrl || `${frontendBase}/s/${orgSlug}/store/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = config.cancelUrl || `${frontendBase}/s/${orgSlug}/store/cancel`;

        if (!stripeSecretKey) {
            throw new Error('CONFIG_REQUIRED:STRIPE_KEY');
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-01-27.acacia' as any,
        });

        // 1. Criar o Pedido no Banco (PENDING)
        const totalCents = data.items.reduce((acc: number, item: any) => acc + (item.priceCents * item.quantity), 0);

        const order = await prisma.storeOrder.create({
            data: {
                organizationId: orgId,
                externalCustomerId: data.externalCustomerId,
                paymentProvider: 'STRIPE',
                status: 'PENDING',
                totalCents,
                currency: settings.currency || 'BRL',
                items: {
                    create: data.items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPriceCents: item.priceCents,
                        totalCents: item.priceCents * item.quantity,
                    }))
                }
            }
        });

        // 2. Criar a sessão no Stripe
        const lineItems = data.items.map((item: any) => ({
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

        const isSubscription = data.items.some((i: any) => i.billingCycle && i.billingCycle !== 'ONE_TIME');

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
        await prisma.storeOrder.update({
            where: { id: order.id },
            data: { paymentIntentId: session.id }
        });

        return {
            orderId: order.id,
            checkoutUrl: session.url,
        };
    }
}

