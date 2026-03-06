import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';
import { eventBus } from '../services/event-bus';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake', {
    apiVersion: '2025-02-24.acacia' as any
});

export class PaymentController {
    // POST /payments/webhook/stripe
    async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event: Stripe.Event;

        if (!webhookSecret || !sig) {
            console.error('[STRIPE] Missing webhook secret or signature');
            return res.status(400).send(`Webhook Error: Missing secret or signature`);
        }

        try {
            // Se o express middleware ja parser o body como Buffer/Raw, funciona nativo.
            // O correto em next.js/express é pegar o raw body.
            const rawBody = (req as any).rawBody || req.body;
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err: any) {
            console.error(`[STRIPE] Error validation webhook signature: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log(`[PAYMENT] 📥 Webhook validado pelo Stripe SDK: ${event.type}`);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // 1. Verificar se é um pedido de loja (StoreOrder)
            const storeOrder = await prisma.storeOrder.findFirst({
                where: { paymentIntentId: session.id },
                include: {
                    items: { include: { product: true } },
                    organization: true,
                },
            });

            if (storeOrder) {
                // 1a. Marcar pedido como pago
                await prisma.storeOrder.update({
                    where: { id: storeOrder.id },
                    data: { status: 'PAID', paidAt: new Date() },
                });

                // 1b. Marcar itens como entregues
                await prisma.storeOrderItem.updateMany({
                    where: { orderId: storeOrder.id },
                    data: { deliveryStatus: 'DELIVERED' },
                });

                // 1c. Emitir evento para entrega via Discord
                eventBus.emitEvent('store.order.paid', {
                    orderId: storeOrder.id,
                    organizationId: storeOrder.organizationId,
                    guildId: (storeOrder.organization as any)?.discordGuildId,
                    externalCustomerId: storeOrder.externalCustomerId,
                    items: storeOrder.items,
                });

                console.log(`[PAYMENT] ✅ StoreOrder ${storeOrder.id} pago e entregue para Discord user ${storeOrder.externalCustomerId}`);
                return res.json({ received: true });
            }

            // 2. Caso contrário, é um pagamento de billing (plano)
            try {
                const payment = await prisma.payment.update({
                    where: { providerId: session.id },
                    data: { status: 'paid' }
                });

                eventBus.emitEvent('payment.confirmed', {
                    payment,
                    organizationId: payment.organizationId,
                    userId: payment.userId,
                    metadata: session.metadata
                });

                console.log(`[PAYMENT] ✅ Billing payment confirmado para Org: ${payment.organizationId}`);
            } catch (err: any) {
                // Sessão não encontrada em nenhuma das tabelas — logar e ignorar
                console.warn(`[PAYMENT] ⚠️ Sessão ${session.id} não encontrada em Payment nem StoreOrder. Ignorando.`);
            }
        }

        return res.json({ received: true });
    }
}

export const paymentController = new PaymentController();
