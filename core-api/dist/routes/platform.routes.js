"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const prisma_1 = __importDefault(require("../lib/prisma"));
const platform_service_1 = require("../services/domain/platform.service");
const platformRoutes = (0, express_1.Router)();
const platformService = new platform_service_1.PlatformService();
// Todas as rotas de plataforma exigem autenticação e cargo de SUPER_ADMIN
platformRoutes.use(auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)('SUPER_ADMIN'));
// GET /platform/overview
platformRoutes.get('/overview', async (req, res) => {
    try {
        const data = await platformService.getGlobalMetrics();
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar overview da plataforma.' });
    }
});
// GET /platform/organizations
platformRoutes.get('/organizations', async (req, res) => {
    try {
        const orgs = await prisma_1.default.organization.findMany({
            include: {
                owner: { select: { username: true, discordId: true, avatar: true } },
                _count: { select: { servers: true, members: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orgs);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar organizações da plataforma.' });
    }
});
// GET /platform/billing
platformRoutes.get('/billing', async (req, res) => {
    try {
        const payments = await prisma_1.default.payment.findMany({
            include: { organization: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(payments);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pagamentos da plataforma.' });
    }
});
// PATCH /platform/organizations/:id
platformRoutes.patch('/organizations/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { status, plan } = req.body;
        const updated = await prisma_1.default.organization.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(plan && { plan })
            }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar organização.' });
    }
});
// DELETE /platform/organizations/:id
platformRoutes.delete('/organizations/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const org = await prisma_1.default.organization.findUnique({ where: { id } });
        if (!org)
            return res.status(404).json({ error: 'Organização não encontrada.' });
        // Cascata manual — deleta todos os relacionamentos antes da org
        await prisma_1.default.$transaction(async (tx) => {
            // 1. Module configs and automation logs
            const orgServers = await tx.server.findMany({ where: { organizationId: id }, select: { id: true } });
            const serverIds = orgServers.map(s => s.id);
            // 2. Automation logs
            await tx.automationLog.deleteMany({ where: { organizationId: id } });
            // 3. Automations
            await tx.automation.deleteMany({ where: { organizationId: id } });
            // 4. Module configs (se existir)
            try {
                await tx.moduleConfig.deleteMany({ where: { organizationId: id } });
            }
            catch { }
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
    }
    catch (error) {
        console.error('[DELETE ORG]', error);
        res.status(500).json({ error: 'Erro ao remover organização.', detail: error?.message });
    }
});
// GET /platform/automations
platformRoutes.get('/automations', async (req, res) => {
    try {
        const rules = await prisma_1.default.automation.findMany({
            include: { organization: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rules);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar automações.' });
    }
});
// GET /platform/automations/logs
platformRoutes.get('/automations/logs', async (req, res) => {
    try {
        const logs = await prisma_1.default.automationLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar logs de automação.' });
    }
});
// PATCH /platform/automations/:id/toggle
platformRoutes.patch('/automations/:id/toggle', async (req, res) => {
    try {
        const id = req.params.id;
        const rule = await prisma_1.default.automation.findUnique({ where: { id } });
        if (!rule)
            return res.status(404).json({ error: 'Regra não encontrada.' });
        const updated = await prisma_1.default.automation.update({
            where: { id },
            data: { isActive: !rule.isActive }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao alternar status da automação.' });
    }
});
// GET /platform/infrastructure
platformRoutes.get('/infrastructure', async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar status da infraestrutura.' });
    }
});
// GET /platform/infrastructure/errors
platformRoutes.get('/infrastructure/errors', async (req, res) => {
    try {
        const errors = await prisma_1.default.automationLog.findMany({
            where: { status: 'FAILED' },
            include: { organization: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(errors);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar logs de infraestrutura.' });
    }
});
// POST /platform/infrastructure/reconnect/:driver
platformRoutes.post('/infrastructure/reconnect/:driver', async (req, res) => {
    const { driver } = req.params;
    // Mocking reconnection for now
    console.log(`[CORE API] Reconnecting driver: ${driver}`);
    res.json({ message: `Reconexão do ${driver} iniciada.` });
});
// GET /platform/feature-flags
platformRoutes.get('/feature-flags', async (req, res) => {
    try {
        const flags = await prisma_1.default.featureFlag.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(flags);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar feature flags.' });
    }
});
// PATCH /platform/feature-flags/:id/toggle
platformRoutes.patch('/feature-flags/:id/toggle', async (req, res) => {
    try {
        const id = req.params.id;
        const flag = await prisma_1.default.featureFlag.findUnique({ where: { id } });
        if (!flag)
            return res.status(404).json({ error: 'Flag não encontrada.' });
        const updated = await prisma_1.default.featureFlag.update({
            where: { id },
            data: { enabled: !flag.enabled }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao alternar feature flag.' });
    }
});
exports.default = platformRoutes;
