"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const event_bus_1 = require("../services/event-bus");
const delivery_service_1 = require("../services/domain/delivery.service");
class WebhookController {
    static async handleStripe(req, res) {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const payload = req.body;
        let event;
        try {
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
                apiVersion: '2025-01-27.acacia',
            });
            /* FIX C2: sem assinatura, rejeita imediatamente */
            if (!endpointSecret || !sig) {
                return res.status(400).json({ error: 'Webhook n\u00e3o assinado.' });
            }
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        }
        catch (err) {
            console.error(`[STRIPE WEBHOOK] ❌ Erro de assinatura:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // Idempotency check: prevent duplicate processing
        const eventId = event.id;
        const existingEvent = await prisma_1.default.payment.findUnique({
            where: { stripeEventId: eventId }
        });
        if (existingEvent) {
            console.log(`[STRIPE WEBHOOK] ⚠️ Evento duplicado ignorado: ${eventId}`);
            return res.json({ received: true, duplicate: true });
        }
        console.log(`[STRIPE WEBHOOK] 🔔 Evento recebido: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await this.processSuccessfulCheckout(session, event.id);
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object;
                /* FIX C3: guarda de tipo segura em vez de (invoice as any).subscription */
                if ('subscription' in invoice && typeof invoice.subscription === 'string') {
                    await this.processSuccessfulSubscriptionPayment(invoice, event.id);
                }
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                await this.handleSubscriptionUpdated(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await this.handleSubscriptionDeleted(subscription);
                break;
            }
        }
        res.json({ received: true });
    }
    static async processSuccessfulCheckout(session, stripeEventId) {
        const type = session.metadata?.type;
        const organizationId = session.metadata?.organizationId;
        if (type === 'SAAS_UPGRADE' && organizationId) {
            return this.handleSaaSUpgrade(session, stripeEventId);
        }
        const orderId = session.metadata?.orderId;
        if (!orderId)
            return;
        console.log(`[STRIPE WEBHOOK] ✅ Pagamento aprovado para Order: ${orderId}`);
        // 1. Atualizar status do pedido
        const order = await prisma_1.default.storeOrder.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                paymentIntentId: session.payment_intent || session.id,
            },
            include: { items: { include: { product: true } } }
        });
        // 2. Disparar evento para o AutomationEngine
        event_bus_1.eventBus.emit('store.order.paid', {
            orderId,
            organizationId: order.organizationId,
            totalCents: order.totalCents,
            items: order.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                product: item.product,
            })),
            customer: {
                email: session.customer_details?.email,
                name: session.customer_details?.name,
                discordId: session.metadata?.externalCustomerId
            }
        });
        // 3. Atualizar status de entrega dos itens
        await prisma_1.default.storeOrderItem.updateMany({
            where: { orderId: orderId },
            data: { deliveryStatus: 'READY' }
        });
        // 4. CHAMA O SERVIÇO DE ENTREGA AUTOMÁTICA
        await delivery_service_1.DeliveryService.deliverOrder(orderId);
    }
    static async handleSaaSUpgrade(session, stripeEventId) {
        const organizationId = session.metadata?.organizationId;
        const targetPlan = session.metadata?.targetPlan;
        console.log(`[STRIPE WEBHOOK] 🚀 Upgrade de plano detectado: ${targetPlan} para Org: ${organizationId}`);
        await prisma_1.default.organization.update({
            where: { id: organizationId },
            data: {
                plan: targetPlan,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                isActive: true
            }
        });
        // Log payment record with idempotency key
        await prisma_1.default.payment.create({
            data: {
                organizationId,
                amount: (session.amount_total || 0) / 100,
                currency: (session.currency || 'brl').toUpperCase(),
                status: 'paid',
                provider: 'stripe',
                providerId: session.id,
                stripeEventId,
                metadata: JSON.stringify({ targetPlan, subscriptionId: session.subscription })
            }
        });
        event_bus_1.eventBus.emit('org.plan.upgraded', {
            organizationId,
            plan: targetPlan,
            customerId: session.customer,
            subscriptionId: session.subscription
        });
    }
    static async processSuccessfulSubscriptionPayment(invoice, stripeEventId) {
        /* FIX C3: acessa .subscription via guarda de tipo */
        const subscriptionId = 'subscription' in invoice && typeof invoice.subscription === 'string'
            ? invoice.subscription : undefined;
        console.log(`[STRIPE WEBHOOK] 🔄 Assinatura renovada: ${subscriptionId}`);
        // Se quisermos estender a validade ou logar o pagamento recorrente
        if (typeof subscriptionId === 'string') {
            const org = await prisma_1.default.organization.findFirst({
                where: { stripeSubscriptionId: subscriptionId }
            });
            if (org) {
                await prisma_1.default.organization.update({
                    where: { id: org.id },
                    data: { isActive: true }
                });
                // Log payment record with idempotency key
                await prisma_1.default.payment.create({
                    data: {
                        organizationId: org.id,
                        amount: (invoice.amount_paid || 0) / 100,
                        currency: (invoice.currency || 'brl').toUpperCase(),
                        status: 'paid',
                        provider: 'stripe',
                        providerId: invoice.id,
                        stripeEventId,
                        metadata: JSON.stringify({ subscriptionId, invoiceNumber: invoice.number })
                    }
                });
            }
        }
    }
    static async handleSubscriptionUpdated(subscription) {
        console.log(`[STRIPE WEBHOOK] 🔄 Assinatura atualizada: ${subscription.id}`);
        // Map Stripe product to plan (requires metadata or price lookup)
        const priceId = subscription.items.data[0]?.price.id;
        let newPlan = 'FREE';
        // Match price ID to plan (configure these in your .env or Stripe dashboard)
        const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO;
        const STRIPE_PRICE_ENTERPRISE = process.env.STRIPE_PRICE_ENTERPRISE;
        const STRIPE_PRICE_MAX = process.env.STRIPE_PRICE_MAX;
        if (priceId === STRIPE_PRICE_PRO)
            newPlan = 'PRO';
        else if (priceId === STRIPE_PRICE_ENTERPRISE)
            newPlan = 'ENTERPRISE';
        else if (priceId === STRIPE_PRICE_MAX)
            newPlan = 'MAX';
        // Update organization plan if status is active
        if (subscription.status === 'active' || subscription.status === 'trialing') {
            await prisma_1.default.organization.updateMany({
                where: { stripeSubscriptionId: subscription.id },
                data: {
                    plan: newPlan,
                    isActive: true
                }
            });
        }
    }
    static async handleSubscriptionDeleted(subscription) {
        console.log(`[STRIPE WEBHOOK] ❌ Assinatura cancelada: ${subscription.id}`);
        // Downgrade automático para FREE
        await prisma_1.default.organization.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                plan: 'FREE',
                isActive: true // Continua ativo mas no free
            }
        });
    }
}
exports.WebhookController = WebhookController;
