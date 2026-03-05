import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';

function getStripeClient() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        throw new Error('Configuração de pagamento incompleta (STRIPE_SECRET_KEY ausente).');
    }

    return new Stripe(stripeKey, {
        apiVersion: '2025-01-27.acacia' as any
    });
}

export class BillingController {
    // Cria uma sessão de checkout do Stripe para upgrade de plano
    async createCheckoutSession(req: Request, res: Response) {
        const { organizationId } = req.params;
        const { planId } = req.body; // 'PRO', 'ENTERPRISE', 'MAX'
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

        // Use Price IDs from environment (recommended) or fallback to price_data
        const usePriceIds = !!process.env.STRIPE_PRICE_PRO;
        const planPriceIds: Record<string, string> = {
            PRO: process.env.STRIPE_PRICE_PRO || '',
            ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || '',
            MAX: process.env.STRIPE_PRICE_MAX || '',
        };

        // Fallback: hardcoded prices (for dev/test without Stripe setup)
        const planPrices: Record<string, { amount: number, name: string, interval: 'month' | 'year' }> = {
            PRO: { amount: 2900, name: 'Assinatura OrbitOS Pro', interval: 'month' },
            ENTERPRISE: { amount: 9900, name: 'Assinatura OrbitOS Enterprise', interval: 'month' },
            MAX: { amount: 29900, name: 'Assinatura OrbitOS Max', interval: 'year' }
        };

        const plan = planPrices[planId.toUpperCase()];
        if (!plan) return res.status(400).json({ error: 'Plano inválido.' });

        const frontendUrl = process.env.FRONTEND_URL || 'https://orbitup.io';

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('[STRIPE CHECKOUT] Missing STRIPE_SECRET_KEY in environment');
            return res.status(500).json({
                error: 'Configuração de pagamento incompleta (STRIPE_SECRET_KEY ausente).'
            });
        }

        if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
            console.error('[STRIPE CHECKOUT] Invalid FRONTEND_URL:', frontendUrl);
            return res.status(500).json({
                error: 'Configuração inválida de FRONTEND_URL no servidor.'
            });
        }

        try {
            const stripe = getStripeClient();

            const [org, user] = await Promise.all([
                prisma.organization.findUnique({ where: { id: String(organizationId) } }),
                prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
            ]);

            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

            const sessionParams: Stripe.Checkout.SessionCreateParams = {
                payment_method_types: ['card'],
                mode: 'subscription',
                success_url: `${frontendUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${frontendUrl}/dashboard/billing?canceled=true`,
                customer_email: user?.email || undefined,
                metadata: {
                    type: 'SAAS_UPGRADE',
                    organizationId: org.id,
                    targetPlan: String(planId).toUpperCase(),
                    userId: String(userId)
                }
            };

            // Use Price IDs if configured, otherwise use price_data
            if (usePriceIds && planPriceIds[planId.toUpperCase()]) {
                sessionParams.line_items = [{
                    price: planPriceIds[planId.toUpperCase()],
                    quantity: 1
                }];
            } else {
                sessionParams.line_items = [{
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: plan.name,
                            description: `Upgrade para o plano ${planId.toUpperCase()} da organização ${org.name}`,
                        },
                        unit_amount: plan.amount,
                        recurring: { interval: plan.interval },
                    },
                    quantity: 1,
                }];
            }

            const session = await stripe.checkout.sessions.create(sessionParams);

            return res.json({ url: session.url });

        } catch (error: any) {
            console.error('[STRIPE CHECKOUT] Error:', error.message);
            return res.status(500).json({
                error: error?.message ? `Erro ao gerar checkout do Stripe: ${error.message}` : 'Erro ao gerar checkout do Stripe.'
            });
        }
    }

    // Retorna o status da assinatura e uso atual
    async getBillingStatus(req: Request, res: Response) {
        const { organizationId } = req.params;

        try {
            const stripe = getStripeClient();

            const org = await prisma.organization.findUnique({
                where: { id: String(organizationId) },
                include: {
                    _count: {
                        select: { servers: true, tickets: true }
                    }
                }
            }) as any;

            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

            // Buscar subscription ativa no Stripe
            let subscriptionInfo: any = null;
            if (org.stripeSubscriptionId) {
                try {
                    const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
                    subscriptionInfo = {
                        id: subscription.id,
                        status: subscription.status,
                        current_period_end: (subscription as any).current_period_end,
                        cancel_at_period_end: (subscription as any).cancel_at_period_end,
                        cancel_at: (subscription as any).cancel_at,
                    };
                } catch (err) {
                    console.error('[BILLING] Failed to fetch subscription:', err);
                }
            }

            // Buscar faturas reais no Stripe se houver stripeCustomerId
            let invoices: any[] = [];
            if (org.stripeCustomerId) {
                const stripeInvoices = await stripe.invoices.list({
                    customer: org.stripeCustomerId,
                    limit: 5
                });
                invoices = stripeInvoices.data.map(inv => ({
                    id: inv.number,
                    date: new Date(inv.created * 1000).toLocaleDateString('pt-BR'),
                    amount: (inv.total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    status: inv.status === 'paid' ? 'Pago' : 'Pendente',
                    pdf: inv.invoice_pdf
                }));
            }

            return res.json({
                plan: org.plan,
                usage: {
                    servers: org._count?.servers || 0,
                    tickets: org._count?.tickets || 0,
                },
                subscription: subscriptionInfo,
                invoices
            });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar dados de faturamento.' });
        }
    }

    // Portal do cliente para gerenciar assinatura (cartão, cancelamento)
    async createCustomerPortalSession(req: Request, res: Response) {
        const { organizationId } = req.params;

        try {
            const stripe = getStripeClient();

            const org = await prisma.organization.findUnique({
                where: { id: String(organizationId) }
            });

            if (!org || !org.stripeCustomerId) {
                return res.status(400).json({ error: 'Nenhum cliente Stripe associado a esta organização.' });
            }

            const session = await stripe.billingPortal.sessions.create({
                customer: org.stripeCustomerId,
                return_url: `${process.env.FRONTEND_URL}/dashboard/billing`,
            });

            return res.json({ url: session.url });
        } catch (error: any) {
            console.error('[STRIPE PORTAL] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao gerar portal do Stripe.' });
        }
    }

    // Cancela subscription diretamente (alternativa ao portal)
    async cancelSubscription(req: Request, res: Response) {
        const { organizationId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

        try {
            const stripe = getStripeClient();

            const org = await prisma.organization.findUnique({
                where: { id: String(organizationId) }
            });

            if (!org || !org.stripeSubscriptionId) {
                return res.status(400).json({ error: 'Nenhuma assinatura ativa encontrada.' });
            }

            // Cancel at period end (não cancela imediatamente, mantém até fim do período pago)
            const subscription = await stripe.subscriptions.update(org.stripeSubscriptionId, {
                cancel_at_period_end: true
            });

            console.log(`[BILLING] ⚠️ Assinatura ${subscription.id} marcada para cancelamento ao fim do período`);

            return res.json({
                success: true,
                message: 'Assinatura será cancelada ao final do período de cobrança.',
                cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null
            });
        } catch (error: any) {
            console.error('[BILLING CANCEL] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao cancelar assinatura.' });
        }
    }

    // Reativar subscription cancelada (se ainda não expirou)
    async reactivateSubscription(req: Request, res: Response) {
        const { organizationId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

        try {
            const stripe = getStripeClient();

            const org = await prisma.organization.findUnique({
                where: { id: String(organizationId) }
            });

            if (!org || !org.stripeSubscriptionId) {
                return res.status(400).json({ error: 'Nenhuma assinatura encontrada.' });
            }

            const subscription = await stripe.subscriptions.update(org.stripeSubscriptionId, {
                cancel_at_period_end: false
            });

            console.log(`[BILLING] ✅ Assinatura ${subscription.id} reativada`);

            return res.json({
                success: true,
                message: 'Assinatura reativada com sucesso.'
            });
        } catch (error: any) {
            console.error('[BILLING REACTIVATE] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao reativar assinatura.' });
        }
    }
}

export const billingController = new BillingController();
