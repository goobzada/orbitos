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
            if (endpointSecret && sig) {
                event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
            }
            else {
                event = typeof payload === 'string' ? JSON.parse(payload) : payload;
            }
        }
        catch (err) {
            console.error(`[STRIPE WEBHOOK] ❌ Erro de assinatura:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        console.log(`[STRIPE WEBHOOK] 🔔 Evento recebido: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await this.processSuccessfulCheckout(session);
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object;
                if (invoice.subscription) {
                    await this.processSuccessfulSubscriptionPayment(invoice);
                }
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
    static async processSuccessfulCheckout(session) {
        const orderId = session.metadata?.orderId;
        const organizationId = session.metadata?.organizationId;
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
    static async processSuccessfulSubscriptionPayment(invoice) {
        console.log(`[STRIPE WEBHOOK] 🔄 Assinatura renovada: ${invoice.subscription}`);
    }
    static async handleSubscriptionDeleted(subscription) {
        console.log(`[STRIPE WEBHOOK] ❌ Assinatura cancelada: ${subscription.id}`);
    }
}
exports.WebhookController = WebhookController;
