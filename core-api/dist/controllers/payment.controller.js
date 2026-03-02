"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const event_bus_1 = require("../services/event-bus");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_fake', {
    apiVersion: '2025-02-24.acacia'
});
class PaymentController {
    // POST /payments/webhook/stripe
    async stripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;
        if (!webhookSecret || !sig) {
            console.error('[STRIPE] Missing webhook secret or signature');
            return res.status(400).send(`Webhook Error: Missing secret or signature`);
        }
        try {
            // Se o express middleware ja parser o body como Buffer/Raw, funciona nativo.
            // O correto em next.js/express é pegar o raw body.
            const rawBody = req.rawBody || req.body;
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        }
        catch (err) {
            console.error(`[STRIPE] Error validation webhook signature: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        console.log(`[PAYMENT] 📥 Webhook validado pelo Stripe SDK: ${event.type}`);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            // 1. Atualizar banco
            const payment = await prisma_1.default.payment.update({
                where: { providerId: session.id },
                data: { status: 'paid' }
            });
            // 2. Emitir evento para o sistema
            event_bus_1.eventBus.emitEvent('payment.confirmed', {
                payment,
                organizationId: payment.organizationId,
                userId: payment.userId,
                metadata: session.metadata
            });
            console.log(`[PAYMENT] ✅ Pagamento confirmado para Org: ${payment.organizationId}`);
        }
        return res.json({ received: true });
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
