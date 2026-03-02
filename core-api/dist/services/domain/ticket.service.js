"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const event_bus_1 = require("../event-bus");
class TicketService {
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
        // Emitir evento para o Bot enviar ao Discord, se for via painel (staff)
        if (params.isStaff) {
            event_bus_1.eventBus.emitEvent('ticket.message_created', {
                ticketId: params.ticketId,
                discordGuildId: params.discordGuildId,
                discordChannelId: params.discordChannelId,
                content: params.content,
                authorName: params.authorName
            });
        }
        return message;
    }
}
exports.TicketService = TicketService;
