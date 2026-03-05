import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any
});

export class BillingController {
    // Cria uma sessão de checkout do Stripe para upgrade de plano
    async createCheckoutSession(req: Request, res: Response) {
        const { organizationId } = req.params;
        const { planId } = req.body; // 'PRO', 'ENTERPRISE', 'MAX'
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

        // Mapeamento de preços (Exemplo real usaria Price IDs do Stripe)
        const planPrices: Record<string, { amount: number, name: string }> = {
            PRO: { amount: 2900, name: 'Assinatura OrbitOS Pro' },
            ENTERPRISE: { amount: 9900, name: 'Assinatura OrbitOS Enterprise' },
            MAX: { amount: 29900, name: 'Assinatura OrbitOS Max' }
        };

        const plan = planPrices[planId.toUpperCase()];
        if (!plan) return res.status(400).json({ error: 'Plano inválido.' });

        try {
            const [org, user] = await Promise.all([
                prisma.organization.findUnique({ where: { id: String(organizationId) } }),
                prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
            ]);

            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

            // Cria sessão no Stripe
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: plan.name,
                            description: `Upgrade para o plano ${planId.toUpperCase()} da organização ${org.name}`,
                        },
                        unit_amount: plan.amount,
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: `${process.env.FRONTEND_URL}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/dashboard/billing?canceled=true`,
                customer_email: user?.email || undefined,
                metadata: {
                    type: 'SAAS_UPGRADE',
                    organizationId: org.id,
                    targetPlan: String(planId).toUpperCase(),
                    userId: String(userId)
                }
            });

            return res.json({ url: session.url });

        } catch (error: any) {
            console.error('[STRIPE CHECKOUT] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao gerar checkout do Stripe.' });
        }
    }

    // Retorna o status da assinatura e uso atual
    async getBillingStatus(req: Request, res: Response) {
        const { organizationId } = req.params;

        try {
            const org = await prisma.organization.findUnique({
                where: { id: String(organizationId) },
                include: {
                    _count: {
                        select: { servers: true, tickets: true }
                    }
                }
            }) as any;

            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

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
                invoices
            });

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar dados de faturamento.' });
        }
    }
}

export const billingController = new BillingController();
