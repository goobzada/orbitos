"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class OrgController {
    // Lista as Organizações que pertencem ao usuário Logado (Para montar o Switcher do Front)
    async getMyOrganizations(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        // 🔒 PARTE 2: Escopo Multi-Tenant estrito — Dono ou Membro
        const organizations = await prisma_1.default.organization.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } }
                ]
            },
            include: {
                _count: {
                    select: { servers: true, members: true }
                }
            }
        });
        return res.json(organizations);
    }
    async createOrganization(req, res) {
        const userId = req.user?.id;
        const { name, plan = 'FREE', communityType = 'general' } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Nome da organização é obrigatório.' });
        }
        try {
            const organization = await prisma_1.default.organization.create({
                data: {
                    name,
                    ownerId: userId,
                    plan,
                    communityType
                }
            });
            // 📊 PARTE 8: Audit Log
            const { auditService } = await Promise.resolve().then(() => __importStar(require('../services/domain/audit.service')));
            await auditService.log({
                organizationId: organization.id,
                userId: userId,
                action: 'ORGANIZATION_CREATED',
                resourceType: 'Organization',
                resourceId: organization.id,
                metadata: { name, plan }
            });
            return res.status(201).json(organization);
        }
        catch (error) {
            console.error('[ORG] Create error:', error);
            return res.status(500).json({ error: 'Erro ao criar organização.' });
        }
    }
    async updateOrganization(req, res) {
        const organizationId = req.params.organizationId;
        const { name, slug, subdomain, customDomain, communityType, language } = req.body;
        try {
            // Check for unique constraints before updating if fields are provided
            if (slug || subdomain || customDomain) {
                const existingOrg = await prisma_1.default.organization.findFirst({
                    where: {
                        OR: [
                            ...(slug ? [{ slug }] : []),
                            ...(subdomain ? [{ subdomain }] : []),
                            ...(customDomain ? [{ customDomain }] : [])
                        ],
                        NOT: { id: organizationId }
                    }
                });
                if (existingOrg) {
                    return res.status(409).json({ error: 'Slug, subdomínio ou domínio customizado já estão em uso por outra organização.' });
                }
            }
            const formatSlug = (str) => str.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            const organization = await prisma_1.default.organization.update({
                where: { id: organizationId },
                data: {
                    ...(name && { name }),
                    ...(slug && { slug: formatSlug(slug) }),
                    ...(subdomain && { subdomain: formatSlug(subdomain) }),
                    ...(customDomain && { customDomain: customDomain.toLowerCase() }),
                    ...(communityType && { communityType }),
                    ...(language && { language })
                }
            });
            return res.json(organization);
        }
        catch (error) {
            console.error('[ORG] Update error:', error);
            return res.status(500).json({ error: 'Erro ao atualizar dados da organização.' });
        }
    }
    async getAnalytics(req, res) {
        const organizationId = req.params.organizationId;
        try {
            const [totalTickets, openTickets, closedTickets, totalPayments, totalMembers] = await Promise.all([
                prisma_1.default.ticket.count({ where: { organizationId } }),
                prisma_1.default.ticket.count({ where: { organizationId, status: 'OPEN' } }),
                prisma_1.default.ticket.count({ where: { organizationId, status: 'CLOSED' } }),
                prisma_1.default.payment.aggregate({
                    where: { organizationId, status: 'paid' },
                    _sum: { amount: true }
                }),
                prisma_1.default.organizationMember.count({ where: { organizationId } })
            ]);
            // Simple time series mock for now based on actual counts
            const currentMonth = new Date().toLocaleString('pt-BR', { month: 'short' });
            res.json({
                overview: {
                    totalTickets,
                    openTickets,
                    closedTickets,
                    revenue: totalPayments._sum.amount || 0,
                    members: totalMembers
                },
                series: [
                    { name: "SLA Médio", value: "45min", trending: "up" },
                    { name: "Tickets / Dia", value: (totalTickets / 30).toFixed(1), trending: "down" },
                    { name: "Conversão", value: "12%", trending: "up" }
                ],
                chart: [
                    { name: "Semana 1", total: Math.floor(totalTickets * 0.2), active: Math.floor(openTickets * 0.3) },
                    { name: "Semana 2", total: Math.floor(totalTickets * 0.3), active: Math.floor(openTickets * 0.4) },
                    { name: "Semana 3", total: Math.floor(totalTickets * 0.25), active: Math.floor(openTickets * 0.2) },
                    { name: "Semana 4", total: Math.floor(totalTickets * 0.25), active: Math.floor(openTickets * 0.1) },
                ]
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao processar métricas.' });
        }
    }
    async getTicketTemplates(req, res) {
        const organizationId = req.params.organizationId;
        try {
            const templates = await prisma_1.default.ticketTemplate.findMany({
                where: { organizationId },
                include: { fields: true, server: { select: { name: true } } },
                orderBy: { createdAt: 'desc' }
            });
            res.json(templates);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao buscar templates.' });
        }
    }
    async createTicketTemplate(req, res) {
        const organizationId = req.params.organizationId;
        const { name, key, title, description, serverId, language = 'pt-BR' } = req.body;
        try {
            const template = await prisma_1.default.ticketTemplate.create({
                data: {
                    organizationId,
                    serverId,
                    name,
                    key,
                    title,
                    description,
                    language
                }
            });
            res.status(201).json(template);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao criar template.' });
        }
    }
    async deleteTicketTemplate(req, res) {
        const templateId = req.params.templateId;
        try {
            await prisma_1.default.ticketTemplate.delete({ where: { id: templateId } });
            res.json({ message: 'Template excluído.' });
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao excluir template.' });
        }
    }
    async getPublicPortalData(req, res) {
        const slug = req.params.slug;
        try {
            const org = await prisma_1.default.organization.findFirst({
                where: {
                    OR: [
                        { slug: slug },
                        { subdomain: slug }
                    ]
                }
            });
            if (!org) {
                return res.status(404).json({ error: 'Comunidade não encontrada.' });
            }
            const { TemplateService } = await Promise.resolve().then(() => __importStar(require('../services/domain/template.service')));
            const templateService = new TemplateService();
            const identity = await templateService.getIdentity(org.id);
            res.json({
                organization: {
                    id: org.id,
                    name: org.name,
                    slug: org.slug,
                    communityType: org.communityType
                },
                identity
            });
        }
        catch (error) {
            console.error('[PUBLIC PORTAL] Error:', error);
            res.status(500).json({ error: 'Erro ao carregar portal.' });
        }
    }
}
exports.OrgController = OrgController;
