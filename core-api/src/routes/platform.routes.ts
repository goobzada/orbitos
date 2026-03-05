import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import prisma from '../lib/prisma';

import { PlatformService } from '../services/domain/platform.service';
import { platformBillingController } from '../controllers/platform-billing.controller';

const platformRoutes = Router();
const platformService = new PlatformService();

// Todas as rotas de plataforma exigem autenticação e cargo de SUPER_ADMIN
platformRoutes.use(authMiddleware, requireRole('SUPER_ADMIN'));

// GET /platform/overview
platformRoutes.get('/overview', async (req: Request, res: Response) => {
    try {
        const data = await platformService.getGlobalMetrics();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar overview da plataforma.' });
    }
});

// GET /platform/organizations
platformRoutes.get('/organizations', async (req: Request, res: Response) => {
    try {
        const orgs = await prisma.organization.findMany({
            include: {
                owner: { select: { username: true, discordId: true, avatar: true } },
                _count: { select: { servers: true, members: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orgs);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar organizações da plataforma.' });
    }
});

// ─── Platform Billing (Stripe revenue overview for SaaS owner) ──────────────

// GET /platform/billing/overview
platformRoutes.get('/billing/overview', (req, res) => platformBillingController.getOverview(req, res));

// GET /platform/billing/subscriptions
platformRoutes.get('/billing/subscriptions', (req, res) => platformBillingController.getSubscriptions(req, res));

// GET /platform/billing/invoices
platformRoutes.get('/billing/invoices', (req, res) => platformBillingController.getInvoices(req, res));

// GET /platform/billing/payments
platformRoutes.get('/billing/payments', (req, res) => platformBillingController.getPayments(req, res));

// GET /platform/billing/tenants/:orgId
platformRoutes.get('/billing/tenants/:orgId', (req, res) => platformBillingController.getTenantBilling(req, res));

// POST /platform/billing/tenants/:orgId/plan
platformRoutes.post('/billing/tenants/:orgId/plan', (req, res) => platformBillingController.changeTenantPlan(req, res));

// POST /platform/billing/tenants/:orgId/cancel
platformRoutes.post('/billing/tenants/:orgId/cancel', (req, res) => platformBillingController.cancelTenantSubscription(req, res));

// POST /platform/billing/tenants/:orgId/pause
platformRoutes.post('/billing/tenants/:orgId/pause', (req, res) => platformBillingController.pauseTenantSubscription(req, res));

// GET /platform/billing (legacy – list payments from local DB)
platformRoutes.get('/billing', async (req: Request, res: Response) => {
    try {
        const payments = await prisma.payment.findMany({
            include: { organization: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pagamentos da plataforma.' });
    }
});

// PATCH /platform/organizations/:id
platformRoutes.patch('/organizations/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, plan } = req.body;

        const updated = await prisma.organization.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(plan && { plan })
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar organização.' });
    }
});

// DELETE /platform/organizations/:id
platformRoutes.delete('/organizations/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const org = await prisma.organization.findUnique({ where: { id } });
        if (!org) return res.status(404).json({ error: 'Organização não encontrada.' });

        // Cascata manual — deleta todos os relacionamentos antes da org
        await prisma.$transaction(async (tx) => {
            // 1. Module configs and automation logs
            const orgServers = await tx.server.findMany({ where: { organizationId: id }, select: { id: true } });
            const serverIds = orgServers.map(s => s.id);

            // 2. Automation logs
            await tx.automationLog.deleteMany({ where: { organizationId: id } });

            // 3. Automations
            await tx.automation.deleteMany({ where: { organizationId: id } });

            // 4. Module configs (se existir)
            try { await (tx as any).moduleConfig.deleteMany({ where: { organizationId: id } }); } catch { }

            // 5. Tickets do servidor
            if (serverIds.length > 0) {
                await tx.ticket.deleteMany({ where: { serverId: { in: serverIds } } });
                await tx.staffMember.deleteMany({ where: { serverId: { in: serverIds } } });
            }

            // 6. Membros da org
            await tx.organizationMember.deleteMany({ where: { organizationId: id } });

            // 7. Pagamentos
            await tx.payment.deleteMany({ where: { organizationId: id } });

            // 8. Servers
            await tx.server.deleteMany({ where: { organizationId: id } });

            // 9. Por fim, a organização
            await tx.organization.delete({ where: { id } });
        });

        res.json({ message: 'Organização e todos os dados relacionados foram removidos permanentemente.' });
    } catch (error: any) {
        console.error('[DELETE ORG]', error);
        res.status(500).json({ error: 'Erro ao remover organização.', detail: error?.message });
    }
});


// GET /platform/automations
platformRoutes.get('/automations', async (req: Request, res: Response) => {
    try {
        const rules = await prisma.automation.findMany({
            include: { organization: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar automações.' });
    }
});

// GET /platform/automations/logs
platformRoutes.get('/automations/logs', async (req: Request, res: Response) => {
    try {
        const logs = await prisma.automationLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar logs de automação.' });
    }
});

// PATCH /platform/automations/:id/toggle
platformRoutes.patch('/automations/:id/toggle', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const rule = await prisma.automation.findUnique({ where: { id } });
        if (!rule) return res.status(404).json({ error: 'Regra não encontrada.' });

        const updated = await prisma.automation.update({
            where: { id },
            data: { isActive: !rule.isActive }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alternar status da automação.' });
    }
});

// GET /platform/infrastructure
platformRoutes.get('/infrastructure', async (req: Request, res: Response) => {
    try {
        const drivers = [
            {
                name: "Discord Driver",
                status: "connected", // TODO: Real check with discordDriver.client?.isReady()
                uptime: "99.98%",
                latency: "42ms"
            },
            {
                name: "Automation Engine",
                status: "active",
                uptime: "100%",
                latency: "5ms"
            },
            {
                name: "WebSocket Server",
                status: "active",
                uptime: "99.95%",
                latency: "10ms"
            }
        ];

        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar status da infraestrutura.' });
    }
});

// GET /platform/infrastructure/errors
platformRoutes.get('/infrastructure/errors', async (req: Request, res: Response) => {
    try {
        const errors = await prisma.automationLog.findMany({
            where: { status: 'FAILED' },
            include: { organization: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(errors);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar logs de infraestrutura.' });
    }
});

// POST /platform/infrastructure/reconnect/:driver
platformRoutes.post('/infrastructure/reconnect/:driver', async (req: Request, res: Response) => {
    const { driver } = req.params;
    // Mocking reconnection for now
    console.log(`[CORE API] Reconnecting driver: ${driver}`);
    res.json({ message: `Reconexão do ${driver} iniciada.` });
});

// GET /platform/feature-flags
platformRoutes.get('/feature-flags', async (req: Request, res: Response) => {
    try {
        const flags = await prisma.featureFlag.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(flags);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar feature flags.' });
    }
});

// PATCH /platform/feature-flags/:id/toggle
platformRoutes.patch('/feature-flags/:id/toggle', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const flag = await prisma.featureFlag.findUnique({ where: { id } });
        if (!flag) return res.status(404).json({ error: 'Flag não encontrada.' });

        const updated = await prisma.featureFlag.update({
            where: { id },
            data: { enabled: !flag.enabled }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alternar feature flag.' });
    }
});

export default platformRoutes;
