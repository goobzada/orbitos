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
exports.InternalController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const module_service_1 = require("../services/domain/module.service");
// Rota exclusiva para o Bot Engine. Protegida por Internal Service Key (não por JWT)
class InternalController {
    // Bot notifica quando chega em um novo servidor
    async syncGuild(req, res) {
        const { discordGuildId, name, icon, memberCount } = req.body;
        if (!discordGuildId || !name) {
            return res.status(400).json({ error: 'discordGuildId e name são obrigatórios.' });
        }
        const existing = await prisma_1.default.server.findUnique({ where: { discordGuildId } });
        if (!existing) {
            return res.status(404).json({
                error: 'Servidor não associado a nenhuma organização no SaaS.',
                hint: 'Adicione o servidor pelo Dashboard primeiro.'
            });
        }
        const updated = await prisma_1.default.server.update({
            where: { discordGuildId },
            data: { name, icon, isActive: true }
        });
        return res.json({ message: 'Servidor sincronizado!', server: updated });
    }
    // Bot notifica quando foi removido de um servidor
    async disconnectGuild(req, res) {
        const { guildId } = req.params;
        const server = await prisma_1.default.server.findUnique({ where: { discordGuildId: guildId } });
        if (!server)
            return res.status(404).json({ error: 'Servidor não encontrado.' });
        await prisma_1.default.server.update({
            where: { discordGuildId: guildId },
            data: { isActive: false }
        });
        return res.json({ message: `Servidor ${guildId} marcado como desconectado.` });
    }
    // Bot notifica quando um usuário cria um ticket no Discord
    async createTicket(req, res) {
        const { discordGuildId, authorId, subject, description, channelId } = req.body;
        if (!discordGuildId || !authorId || !subject) {
            return res.status(400).json({ error: 'discordGuildId, authorId e subject são obrigatórios.' });
        }
        const server = await prisma_1.default.server.findUnique({ where: { discordGuildId } });
        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado no SaaS.' });
        }
        const ticket = await prisma_1.default.ticket.create({
            data: {
                organizationId: server.organizationId,
                serverId: server.id,
                authorId,
                channelId,
                status: client_1.TicketStatus.OPEN,
            }
        });
        // 🔔 Avisar Dashboard em tempo real
        const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../services/ws-server')));
        communityWSServer.broadcastToDashboard(server.organizationId, 'TICKET_CREATED', ticket);
        return res.status(201).json(ticket);
    }
    // Bot notifica quando o ticket é fechado no Discord
    async closeTicket(req, res) {
        const { id } = req.params;
        try {
            const ticket = await prisma_1.default.ticket.update({
                where: { id },
                data: { status: client_1.TicketStatus.CLOSED, closedAt: new Date() },
                include: { server: true }
            });
            // 🔔 Avisar Dashboard em tempo real
            const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../services/ws-server')));
            communityWSServer.broadcastToDashboard(ticket.organizationId, 'TICKET_UPDATED', ticket);
            return res.json({ message: 'Ticket fechado!', ticket });
        }
        catch (error) {
            console.error(`[INTERNAL CLOSE] ❌ Erro ao fechar ticket ${id}: ${error.message}`);
            return res.status(500).json({ error: 'Erro ao fechar ticket. Talvez o ID seja inválido ou local.' });
        }
    }
    // Bot notifica quando uma mensagem é enviada no canal do ticket no Discord
    async receiveTicketMessage(req, res) {
        const { discordGuildId, channelId, content, authorId, authorName, authorAvatar, isStaff } = req.body;
        if (!discordGuildId || !channelId || !content) {
            return res.status(400).json({ error: 'discordGuildId, channelId e content são obrigatórios.' });
        }
        let ticket = await prisma_1.default.ticket.findFirst({
            where: { channelId, server: { discordGuildId } }
        });
        // 🧠 Community OS Autolink: se n\u00e3o achamos pelo canal, mas achamos um ticket ABERTO do autor sem canal vinculado...
        if (!ticket) {
            ticket = await prisma_1.default.ticket.findFirst({
                where: {
                    authorId,
                    status: client_1.TicketStatus.OPEN,
                    channelId: null,
                    server: { discordGuildId }
                },
                orderBy: { createdAt: 'desc' }
            });
            if (ticket) {
                console.log(`[TICKET LINK] 🔗 Vinculando canal ${channelId} ao ticket ${ticket.id} automaticamente.`);
                await prisma_1.default.ticket.update({
                    where: { id: ticket.id },
                    data: { channelId }
                });
            }
        }
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket não encontrado para este canal.' });
        }
        const message = await prisma_1.default.ticketMessage.create({
            data: {
                ticketId: ticket.id,
                authorId,
                authorName,
                authorAvatar,
                authorType: isStaff ? 'STAFF' : 'USER',
                isStaff,
                content
            }
        });
        await prisma_1.default.ticket.update({
            where: { id: ticket.id },
            data: { updatedAt: new Date() }
        });
        return res.status(201).json(message);
    }
    // Bot registra ação de moderação
    async logModeration(req, res) {
        const { discordGuildId, staffId, staffName, userId, username, reason, type, duration } = req.body;
        const server = await prisma_1.default.server.findUnique({ where: { discordGuildId }, select: { id: true, organizationId: true } });
        if (server) {
            await prisma_1.default.moderationLog.create({
                data: {
                    organizationId: server.organizationId,
                    serverId: server.id,
                    moderatorId: staffId,
                    targetUserId: userId,
                    action: type?.toUpperCase() || 'MOD',
                    reason: reason || null
                }
            });
        }
        console.log(`[MODLOG] ${type?.toUpperCase() || 'MOD'} | Guild: ${discordGuildId} | Staff: ${staffName} → ${username} | Motivo: ${reason}`);
        return res.status(200).json({ message: `Ação de moderação (${type}) registrada.` });
    }
    // Bot notifica quando um novo membro entra
    async memberJoin(req, res) {
        const { discordGuildId, userId, username } = req.body;
        // Retorna quais auto-roles aplicar (configurado no painel)
        // Por ora retorna vazio — será expandido com a tabela de configs
        return res.json({ autoRoles: [], logChannelId: null });
    }
    // Heartbeat periódico do bot
    async heartbeat(req, res) {
        const { guildIds, uptime, ping } = req.body;
        console.log(`[HEARTBEAT] 💓 Guilds: ${guildIds?.length || 0} | WS: ${ping}ms | Uptime: ${Math.floor(uptime / 1000)}s`);
        if (Array.isArray(guildIds) && guildIds.length > 0) {
            await prisma_1.default.server.updateMany({
                where: { discordGuildId: { in: guildIds } },
                data: { lastSeenAt: new Date(), isActive: true }
            });
        }
        return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }
    // Bot solicita configurações de módulos para um servidor específico
    async getGuildModules(req, res) {
        const { guildId } = req.params;
        const server = await prisma_1.default.server.findUnique({
            where: { discordGuildId: guildId },
            include: { organization: true }
        });
        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado.' });
        }
        const allModules = await module_service_1.moduleService.listModules();
        const tenantModules = await module_service_1.moduleService.getTenantModules(server.organizationId);
        const activeMap = new Map();
        tenantModules.forEach(tm => {
            activeMap.set(tm.module.key, tm);
        });
        const result = allModules.map(m => {
            const tenantMod = activeMap.get(m.key);
            return {
                ...m,
                active: tenantMod ? tenantMod.isActive : false,
                config: tenantMod ? tenantMod.config : {}
            };
        });
        return res.json({
            communityType: server.organization?.communityType || 'general',
            language: server.organization?.language || 'pt-BR',
            plan: server.organization?.plan || 'FREE',
            isActive: server.organization?.isActive ?? true,
            modules: result.filter(m => m.active)
        });
    }
    // Lista todos os servidores ativos — usado pelo Orbit Agent Supervisor
    async listServers(req, res) {
        const servers = await prisma_1.default.server.findMany({
            where: { isActive: true },
            select: { discordGuildId: true, name: true },
        });
        return res.json(servers);
    }
    // Bot busca produtos da loja para exibir no Discord
    async getStoreProducts(req, res) {
        const guildId = req.params.guildId;
        const server = await prisma_1.default.server.findUnique({
            where: { discordGuildId: guildId },
            include: { organization: true }
        });
        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado.' });
        }
        const products = await prisma_1.default.storeProduct.findMany({
            where: {
                organizationId: server.organizationId,
                status: 'ACTIVE'
            },
            orderBy: { createdAt: 'desc' },
            take: 25
        });
        return res.json({
            organization: server.organization?.name || server.name,
            products
        });
    }
}
exports.InternalController = InternalController;
