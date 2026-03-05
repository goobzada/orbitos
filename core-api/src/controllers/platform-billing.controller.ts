import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any,
});

export class PlatformBillingController {

    // GET /platform/billing/overview
    async getOverview(req: Request, res: Response) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const [
                activeSubscriptions,
                trials,
                pastDue,
                canceledLast30d,
                allActive,
            ] = await Promise.all([
                prisma.organization.count({ where: { subscriptionStatus: 'active' } }),
                prisma.organization.count({ where: { subscriptionStatus: 'trialing' } }),
                prisma.organization.count({ where: { subscriptionStatus: 'past_due' } }),
                prisma.organization.count({
                    where: {
                        subscriptionStatus: 'canceled',
                        updatedAt: { gte: thirtyDaysAgo },
                    },
                }),
                prisma.organization.findMany({
                    where: { subscriptionStatus: { in: ['active', 'trialing'] } },
                    select: { planPriceId: true },
                }),
            ]);

            // Compute MRR from Stripe prices if available
            let mrr = 0;
            let revenueLast30d = 0;

            if (process.env.STRIPE_SECRET_KEY) {
                try {
                    // Sum MRR from active subscriptions via Stripe balance transactions
                    const balanceTxns = await stripe.balanceTransactions.list({
                        type: 'charge',
                        created: { gte: Math.floor(thirtyDaysAgo.getTime() / 1000) },
                        limit: 100,
                    });
                    revenueLast30d = balanceTxns.data.reduce((sum, t) => sum + t.net, 0);

                    // Get MRR from active subscriptions in Stripe
                    const subscriptions = await stripe.subscriptions.list({
                        status: 'active',
                        limit: 100,
                    });
                    mrr = subscriptions.data.reduce((sum, sub) => {
                        const monthly = sub.items.data.reduce((s, item) => {
                            const price = item.price;
                            const amount = price.unit_amount || 0;
                            if (price.recurring?.interval === 'year') return s + Math.round(amount / 12);
                            return s + amount;
                        }, 0);
                        return sum + monthly;
                    }, 0);
                } catch {
                    // Stripe not configured — skip
                }
            }

            const arr = mrr * 12;

            return res.json({
                mrr,
                arr,
                activeSubscriptions,
                trials,
                pastDue,
                canceledLast30d,
                revenueLast30d,
            });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] getOverview error:', error.message);
            return res.status(500).json({ error: 'Erro ao buscar overview de billing.' });
        }
    }

    // GET /platform/billing/subscriptions
    async getSubscriptions(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page || '1')));
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'))));
            const status = req.query.status as string | undefined;
            const planId = req.query.planId as string | undefined;
            const search = req.query.search as string | undefined;

            const where: any = {};
            if (status) where.subscriptionStatus = status;
            if (planId) where.plan = planId;
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { owner: { email: { contains: search, mode: 'insensitive' } } },
                    { owner: { username: { contains: search, mode: 'insensitive' } } },
                ];
            }

            const [orgs, total] = await Promise.all([
                prisma.organization.findMany({
                    where,
                    include: {
                        owner: { select: { email: true, username: true, discordId: true } },
                    },
                    orderBy: { updatedAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                prisma.organization.count({ where }),
            ]);

            const items = orgs.map((org) => ({
                orgId: org.id,
                orgName: org.name,
                ownerEmail: org.owner?.email,
                ownerUsername: org.owner?.username,
                plan: org.plan,
                planPriceId: org.planPriceId,
                subscriptionStatus: org.subscriptionStatus,
                stripeSubscriptionId: org.stripeSubscriptionId,
                stripeCustomerId: org.stripeCustomerId,
                currentPeriodEnd: org.currentPeriodEnd,
                cancelAtPeriodEnd: org.cancelAtPeriodEnd,
                lastInvoiceStatus: org.lastInvoiceStatus,
                createdAt: org.createdAt,
            }));

            return res.json({ items, total, page, limit });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] getSubscriptions error:', error.message);
            return res.status(500).json({ error: 'Erro ao listar assinaturas.' });
        }
    }

    // GET /platform/billing/invoices
    async getInvoices(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page || '1')));
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'))));
            const status = req.query.status as string | undefined;
            const search = req.query.search as string | undefined;

            if (!process.env.STRIPE_SECRET_KEY) {
                return res.json({ items: [], total: 0, page, limit });
            }

            const params: Stripe.InvoiceListParams = {
                limit: 100,
                expand: ['data.customer', 'data.subscription'],
            };
            if (status) params.status = status as Stripe.InvoiceListParams['status'];

            const stripeInvoices = await stripe.invoices.list(params);

            // Enrich with org data
            const customerIds = [
                ...new Set(
                    stripeInvoices.data
                        .map((inv) => (typeof inv.customer === 'string' ? inv.customer : inv.customer?.id))
                        .filter(Boolean) as string[]
                ),
            ];

            const orgs = await prisma.organization.findMany({
                where: { stripeCustomerId: { in: customerIds } },
                select: { id: true, name: true, stripeCustomerId: true },
            });
            const orgByCustomer = Object.fromEntries(orgs.map((o) => [o.stripeCustomerId, o]));

            let items = stripeInvoices.data.map((inv) => {
                const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
                const org = customerId ? orgByCustomer[customerId] : undefined;
                return {
                    id: inv.id,
                    number: inv.number,
                    orgId: org?.id,
                    orgName: org?.name,
                    stripeCustomerId: customerId,
                    status: inv.status,
                    amountDue: inv.amount_due,
                    amountPaid: inv.amount_paid,
                    currency: inv.currency,
                    hostedInvoiceUrl: inv.hosted_invoice_url,
                    invoicePdf: inv.invoice_pdf,
                    created: new Date(inv.created * 1000).toISOString(),
                };
            });

            if (search) {
                const q = search.toLowerCase();
                items = items.filter(
                    (i) =>
                        i.orgName?.toLowerCase().includes(q) ||
                        i.number?.toLowerCase().includes(q) ||
                        i.id.toLowerCase().includes(q)
                );
            }

            const total = items.length;
            const start = (page - 1) * limit;
            const paginated = items.slice(start, start + limit);

            return res.json({ items: paginated, total, page, limit });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] getInvoices error:', error.message);
            return res.status(500).json({ error: 'Erro ao listar faturas.' });
        }
    }

    // GET /platform/billing/payments
    async getPayments(req: Request, res: Response) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page || '1')));
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'))));
            const status = req.query.status as string | undefined;
            const search = req.query.search as string | undefined;

            if (!process.env.STRIPE_SECRET_KEY) {
                return res.json({ items: [], total: 0, page, limit });
            }

            const params: Stripe.PaymentIntentListParams = { limit: 100 };

            const stripePayments = await stripe.paymentIntents.list(params);

            const customerIds = [
                ...new Set(
                    stripePayments.data
                        .map((pi) => (typeof pi.customer === 'string' ? pi.customer : pi.customer?.id))
                        .filter(Boolean) as string[]
                ),
            ];

            const orgs = await prisma.organization.findMany({
                where: { stripeCustomerId: { in: customerIds } },
                select: { id: true, name: true, stripeCustomerId: true },
            });
            const orgByCustomer = Object.fromEntries(orgs.map((o) => [o.stripeCustomerId, o]));

            let items = stripePayments.data.map((pi) => {
                const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer?.id;
                const org = customerId ? orgByCustomer[customerId] : undefined;
                return {
                    id: pi.id,
                    orgId: org?.id,
                    orgName: org?.name,
                    stripeCustomerId: customerId,
                    amount: pi.amount,
                    currency: pi.currency,
                    status: pi.status,
                    created: new Date(pi.created * 1000).toISOString(),
                };
            });

            if (status) items = items.filter((i) => i.status === status);
            if (search) {
                const q = search.toLowerCase();
                items = items.filter(
                    (i) =>
                        i.orgName?.toLowerCase().includes(q) ||
                        i.id.toLowerCase().includes(q)
                );
            }

            const total = items.length;
            const start = (page - 1) * limit;
            const paginated = items.slice(start, start + limit);

            return res.json({ items: paginated, total, page, limit });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] getPayments error:', error.message);
            return res.status(500).json({ error: 'Erro ao listar pagamentos.' });
        }
    }

    // GET /platform/billing/tenants/:orgId
    async getTenantBilling(req: Request, res: Response) {
        try {
            const orgId = String(req.params.orgId);

            const org = await prisma.organization.findUnique({
                where: { id: orgId },
                include: {
                    owner: { select: { email: true, username: true, discordId: true } },
                },
            }) as any;

            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

            let subscription: any = null;
            let invoices: any[] = [];

            if (org.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
                try {
                    subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
                } catch { /* subscription may be deleted */ }
            }

            if (org.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
                try {
                    const stripeInvoices = await stripe.invoices.list({
                        customer: org.stripeCustomerId,
                        limit: 10,
                    });
                    invoices = stripeInvoices.data.map((inv) => ({
                        id: inv.id,
                        number: inv.number,
                        status: inv.status,
                        amountDue: inv.amount_due,
                        amountPaid: inv.amount_paid,
                        currency: inv.currency,
                        hostedInvoiceUrl: inv.hosted_invoice_url,
                        invoicePdf: inv.invoice_pdf,
                        created: new Date(inv.created * 1000).toISOString(),
                    }));
                } catch { /* ignore */ }
            }

            return res.json({
                org: {
                    id: org.id,
                    name: org.name,
                    plan: org.plan,
                    planPriceId: org.planPriceId,
                    subscriptionStatus: org.subscriptionStatus,
                    stripeCustomerId: org.stripeCustomerId,
                    stripeSubscriptionId: org.stripeSubscriptionId,
                    currentPeriodEnd: org.currentPeriodEnd,
                    cancelAtPeriodEnd: org.cancelAtPeriodEnd,
                    lastInvoiceStatus: org.lastInvoiceStatus,
                    isActive: org.isActive,
                    ownerEmail: org.owner?.email,
                    ownerUsername: org.owner?.username,
                    createdAt: org.createdAt,
                },
                subscription,
                invoices,
            });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] getTenantBilling error:', error.message);
            return res.status(500).json({ error: 'Erro ao buscar billing do tenant.' });
        }
    }

    // POST /platform/billing/tenants/:orgId/plan
    async changeTenantPlan(req: Request, res: Response) {
        try {
            const orgId = String(req.params.orgId);
            const { priceId, proration = true } = req.body;

            if (!priceId) return res.status(400).json({ error: 'priceId é obrigatório.' });

            const org = await prisma.organization.findUnique({ where: { id: orgId } });
            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

            if (!org.stripeSubscriptionId) {
                return res.status(400).json({ error: 'Esta organização não possui assinatura Stripe ativa.' });
            }

            const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
            const subscriptionItemId = subscription.items.data[0]?.id;

            if (!subscriptionItemId) {
                return res.status(400).json({ error: 'Nenhum item de assinatura encontrado.' });
            }

            const updated = await stripe.subscriptions.update(org.stripeSubscriptionId, {
                proration_behavior: proration ? 'create_prorations' : 'none',
                items: [{ id: subscriptionItemId, price: priceId }],
            });

            // Retrieve the new price to get the product/plan name
            const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
            const planName = (price.product as Stripe.Product).name || org.plan;

            await prisma.organization.update({
                where: { id: orgId },
                data: {
                    planPriceId: String(priceId),
                    plan: planName,
                    subscriptionStatus: updated.status,
                    currentPeriodEnd: new Date((updated as any).current_period_end * 1000),
                    cancelAtPeriodEnd: updated.cancel_at_period_end,
                },
            });

            return res.json({ message: 'Plano atualizado com sucesso.', subscription: updated });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] changeTenantPlan error:', error.message);
            return res.status(500).json({ error: 'Erro ao alterar plano do tenant.' });
        }
    }

    // POST /platform/billing/tenants/:orgId/cancel
    async cancelTenantSubscription(req: Request, res: Response) {
        try {
            const orgId = String(req.params.orgId);
            const { atPeriodEnd = true } = req.body;

            const org = await prisma.organization.findUnique({ where: { id: orgId } });
            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

            if (!org.stripeSubscriptionId) {
                return res.status(400).json({ error: 'Esta organização não possui assinatura Stripe ativa.' });
            }

            let updated: Stripe.Subscription;
            if (atPeriodEnd) {
                updated = await stripe.subscriptions.update(org.stripeSubscriptionId, {
                    cancel_at_period_end: true,
                });
            } else {
                updated = await stripe.subscriptions.cancel(org.stripeSubscriptionId);
            }

            await prisma.organization.update({
                where: { id: orgId },
                data: {
                    subscriptionStatus: updated.status,
                    cancelAtPeriodEnd: updated.cancel_at_period_end,
                },
            });

            return res.json({ message: 'Assinatura cancelada.', subscription: updated });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] cancelTenantSubscription error:', error.message);
            return res.status(500).json({ error: 'Erro ao cancelar assinatura do tenant.' });
        }
    }

    // POST /platform/billing/tenants/:orgId/pause
    async pauseTenantSubscription(req: Request, res: Response) {
        try {
            const orgId = String(req.params.orgId);

            const org = await prisma.organization.findUnique({ where: { id: orgId } });
            if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

            if (!org.stripeSubscriptionId) {
                return res.status(400).json({ error: 'Esta organização não possui assinatura Stripe ativa.' });
            }

            const updated = await stripe.subscriptions.update(org.stripeSubscriptionId, {
                pause_collection: { behavior: 'void' },
            });

            await prisma.organization.update({
                where: { id: orgId },
                data: { subscriptionStatus: updated.status },
            });

            return res.json({ message: 'Cobrança pausada.', subscription: updated });
        } catch (error: any) {
            console.error('[PLATFORM BILLING] pauseTenantSubscription error:', error.message);
            return res.status(500).json({ error: 'Erro ao pausar assinatura do tenant.' });
        }
    }
}

export const platformBillingController = new PlatformBillingController();
