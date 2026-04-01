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
exports.ticketService = exports.TicketService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
class TicketService {
    async dispatchDiscordAction(action, payload) {
        // The bot-engine communicates exclusively via WebSocket (no BullMQ consumer exists).
        // Broadcast directly to any connected BOT clients — this is the only reliable path.
        const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../ws-server')));
        communityWSServer.broadcastToTarget(payload.serverId, 'DISCORD_ACTION', {
            ...payload,
            action,
        });
    }
    async listTickets(organizationId) {
        const tickets = await prisma_1.default.ticket.findMany({
            where: {
                organizationId
            },
            include: {
                server: {
                    select: {
                        name: true,
                        icon: true,
                        discordGuildId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Adiciona dados formatados para a UI
        return tickets.map(ticket => ({
            id: ticket.id,
            subject: ticket.subject || "Atendimento de Suporte",
            user: ticket.authorId,
            server: ticket.server.name,
            status: ticket.status === 'OPEN' ? 'Aberto' : ticket.status === 'CLOSED' ? 'Fechado' : 'Em Progresso',
            priority: ticket.priority === 'MEDIUM' ? 'Média' : ticket.priority,
            updated: ticket.updatedAt.toISOString(),
            discordGuildId: ticket.server.discordGuildId,
            createdAt: ticket.createdAt,
            closedAt: ticket.closedAt
        }));
    }
    async getTicket(ticketId, organizationId) {
        return prisma_1.default.ticket.findFirst({
            where: {
                id: ticketId,
                organizationId
            },
            include: {
                server: true,
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }
    async addMessage(params) {
        // Criar a mensagem no banco
        const message = await prisma_1.default.ticketMessage.create({
            data: {
                ticketId: params.ticketId,
                authorId: params.authorId,
                authorName: params.authorName,
                authorAvatar: params.authorAvatar,
                content: params.content,
                isStaff: params.isStaff,
                authorType: params.authorType
            }
        });
        // 🚀 Enviar para a fila se for via painel (staff) para o Bot processar em background
        if (params.isStaff && params.discordChannelId) {
            await this.dispatchDiscordAction('send_message', {
                serverId: params.discordGuildId,
                userId: params.authorId,
                params: {
                    channelId: params.discordChannelId,
                    content: `**[Staff] ${params.authorName}:**\n${params.content}`
                }
            });
        }
        return message;
    }
    async closeTicket(ticketId, staffName) {
        const ticket = await prisma_1.default.ticket.findUnique({
            where: { id: ticketId },
            include: { server: true }
        });
        if (!ticket)
            throw new Error('Ticket não encontrado.');
        const updated = await prisma_1.default.ticket.update({
            where: { id: ticketId },
            data: {
                status: client_1.TicketStatus.CLOSED,
                closedAt: new Date(),
                updatedAt: new Date()
            }
        });
        // 🚀 Adicionar na fila de processamento do Discord
        if (ticket.channelId) {
            await this.dispatchDiscordAction('ticket.close_ticket_flow', {
                serverId: ticket.server.discordGuildId,
                userId: 'SYSTEM',
                params: {
                    channelId: ticket.channelId,
                    staffName: staffName,
                    authorId: ticket.authorId,
                    ticketId: ticket.id
                }
            });
        }
        return updated;
    }
    async updateStatus(ticketId, status, staffName) {
        const ticket = await prisma_1.default.ticket.findUnique({
            where: { id: ticketId },
            include: { server: true }
        });
        if (!ticket)
            throw new Error('Ticket não encontrado.');
        const updated = await prisma_1.default.ticket.update({
            where: { id: ticketId },
            data: {
                status,
                updatedAt: new Date(),
                ...(status === client_1.TicketStatus.CLOSED ? { closedAt: new Date() } : {})
            }
        });
        if (ticket.channelId) {
            const statusLabels = {
                OPEN: 'Aberto',
                IN_PROGRESS: 'Em Progresso',
                PENDING: 'Aguardando',
                CLOSED: 'Fechado',
                RESOLVED: 'Resolvido'
            };
            if (status === client_1.TicketStatus.CLOSED) {
                await this.dispatchDiscordAction('ticket.close_ticket_flow', {
                    serverId: ticket.server.discordGuildId,
                    userId: 'SYSTEM',
                    params: {
                        channelId: ticket.channelId,
                        staffName,
                        authorId: ticket.authorId,
                        ticketId: ticket.id
                    }
                });
            }
            else {
                await this.dispatchDiscordAction('send_message', {
                    serverId: ticket.server.discordGuildId,
                    userId: 'SYSTEM',
                    params: {
                        channelId: ticket.channelId,
                        content: `**[Sistema]** O status deste ticket foi alterado para: **${statusLabels[status] || status}**.`
                    }
                });
            }
        }
        return updated;
    }
}
exports.TicketService = TicketService;
exports.ticketService = new TicketService();
