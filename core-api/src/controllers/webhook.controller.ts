import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';
import { eventBus } from '../services/event-bus';
import { DeliveryService } from '../services/domain/delivery.service';

export class WebhookController {
    static async handleStripe(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        const payload = req.body;
        let event: Stripe.Event;

        try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
                apiVersion: '2025-01-27.acacia' as any,
            });

            /* FIX C2: sem assinatura, rejeita imediatamente */
            if (!endpointSecret || !sig) {
                return res.status(400).json({ error: 'Webhook n\u00e3o assinado.' });
            }
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err: any) {
            console.error(`[STRIPE WEBHOOK] ❌ Erro de assinatura:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log(`[STRIPE WEBHOOK] 🔔 Evento recebido: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await this.processSuccessfulCheckout(session);
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                /* FIX C3: guarda de tipo segura em vez de (invoice as any).subscription */
                if ('subscription' in invoice && typeof invoice.subscription === 'string') {
                    await this.processSuccessfulSubscriptionPayment(invoice);
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await this.handleSubscriptionDeleted(subscription);
                break;
            }
        }

        res.json({ received: true });
    }

    private static async processSuccessfulCheckout(session: Stripe.Checkout.Session) {
        const type = session.metadata?.type;
        const organizationId = session.metadata?.organizationId;

        if (type === 'SAAS_UPGRADE' && organizationId) {
            return this.handleSaaSUpgrade(session);
        }

        const orderId = session.metadata?.orderId;
        if (!orderId) return;

        console.log(`[STRIPE WEBHOOK] ✅ Pagamento aprovado para Order: ${orderId}`);

        // 1. Atualizar status do pedido
        const order = await prisma.storeOrder.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                paymentIntentId: session.payment_intent as string || session.id,
            },
            include: { items: { include: { product: true } } }
        });

        // 2. Disparar evento para o AutomationEngine
        eventBus.emit('store.order.paid', {
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
        await prisma.storeOrderItem.updateMany({
            where: { orderId: orderId },
            data: { deliveryStatus: 'READY' }
        });

        // 4. CHAMA O SERVIÇO DE ENTREGA AUTOMÁTICA
        await DeliveryService.deliverOrder(orderId);
    }

    private static async handleSaaSUpgrade(session: Stripe.Checkout.Session) {
        const organizationId = session.metadata?.organizationId!;
        const targetPlan = session.metadata?.targetPlan!;

        console.log(`[STRIPE WEBHOOK] 🚀 Upgrade de plano detectado: ${targetPlan} para Org: ${organizationId}`);

        await prisma.organization.update({
            where: { id: organizationId },
            data: {
                plan: targetPlan,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                isActive: true
            }
        });

        eventBus.emit('org.plan.upgraded', {
            organizationId,
            plan: targetPlan,
            customerId: session.customer,
            subscriptionId: session.subscription
        });
    }

    private static async processSuccessfulSubscriptionPayment(invoice: Stripe.Invoice) {
        /* FIX C3: acessa .subscription via guarda de tipo */
        const subscriptionId = 'subscription' in invoice && typeof invoice.subscription === 'string'
            ? invoice.subscription : undefined;
        console.log(`[STRIPE WEBHOOK] \uD83D\uDD04 Assinatura renovada: ${subscriptionId}`);

        // Se quisermos estender a validade ou logar o pagamento recorrente
        if (typeof subscriptionId === 'string') {
            await prisma.organization.updateMany({
                where: { stripeSubscriptionId: subscriptionId },
                data: { isActive: true }
            });
        }
    }

    private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        console.log(`[STRIPE WEBHOOK] ❌ Assinatura cancelada: ${subscription.id}`);

        // Downgrade automático para FREE
        await prisma.organization.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                plan: 'FREE',
                isActive: true // Continua ativo mas no free
            }
        });
    }
}
