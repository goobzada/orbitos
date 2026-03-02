"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const discord_driver_1 = require("../services/drivers/discord.driver");
class TicketController {
    // Lista todos os tickets das organizações do usuário logado
    async listMyTickets(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado.' });
        }
        const tickets = await prisma_1.default.ticket.findMany({
            where: {
                organization: {
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } }
                    ]
                }
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
        const formattedTickets = tickets.map(ticket => ({
            id: ticket.id,
            subject: ticket.subject || "Atendimento de Suporte",
            user: ticket.authorId,
            server: ticket.server.name,
            status: ticket.status === 'OPEN' ? 'Aberto' : ticket.status === 'CLOSED' ? 'Fechado' : 'Em Progresso',
            priority: ticket.priority === 'MEDIUM' ? 'Média' : ticket.priority,
            updatedAt: ticket.updatedAt.toISOString(),
            discordGuildId: ticket.server.discordGuildId,
            createdAt: ticket.createdAt,
            closedAt: ticket.closedAt
        }));
        return res.json(formattedTickets);
    }
    async getTicket(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        const ticket = await prisma_1.default.ticket.findFirst({
            where: {
                id: id,
                organization: {
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } }
                    ]
                }
            },
            include: {
                server: true,
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
        }
        return res.json(ticket);
    }
    async sendTicketMessage(req, res) {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;
        if (!content) {
            return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório.' });
        }
        try {
            const result = await prisma_1.default.$transaction(async (tx) => {
                const ticket = await tx.ticket.findFirst({
                    where: {
                        id: id,
                        organization: {
                            OR: [
                                { ownerId: userId },
                                { members: { some: { userId } } }
                            ]
                        }
                    },
                    include: { server: true }
                });
                if (!ticket) {
                    throw new Error('NOT_FOUND');
                }
                const message = await tx.ticketMessage.create({
                    data: {
                        ticketId: ticket.id,
                        authorId: userId,
                        authorName: req.user?.username || 'Staff',
                        authorAvatar: req.user?.avatar,
                        content,
                        isStaff: true,
                        authorType: 'STAFF'
                    }
                });
                await tx.ticket.update({
                    where: { id: ticket.id },
                    data: { updatedAt: new Date() }
                });
                return { message, ticket };
            });
            const { message, ticket } = result;
            discord_driver_1.discordDriver.execute({
                serverId: ticket.server.discordGuildId,
                userId: 'SYSTEM',
                action: 'send_message',
                params: {
                    channelId: ticket.channelId,
                    content: `**[Staff] ${message.authorName}:**\n${content}`
                }
            });
            return res.status(201).json(message);
        }
        catch (error) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }
            return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
        }
    }
    async closeTicket(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
            const ticket = await prisma_1.default.ticket.findFirst({
                where: {
                    id: id,
                    organization: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                },
                include: { server: true }
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }
            await prisma_1.default.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: client_1.TicketStatus.CLOSED,
                    closedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            if (ticket.channelId) {
                discord_driver_1.discordDriver.execute({
                    serverId: ticket.server.discordGuildId,
                    userId: 'SYSTEM',
                    action: 'ticket.close_ticket_flow',
                    params: {
                        channelId: ticket.channelId,
                        staffName: req.user?.username || 'Staff'
                    }
                });
            }
            return res.json({ message: 'Ticket fechado com sucesso.' });
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro ao fechar o ticket.' });
        }
    }
    async updateTicketStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;
        if (!status || !Object.values(client_1.TicketStatus).includes(status)) {
            return res.status(400).json({ error: 'Status inválido.' });
        }
        try {
            const ticket = await prisma_1.default.ticket.findFirst({
                where: {
                    id: id,
                    organization: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                },
                include: { server: true }
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }
            const updatedTicket = await prisma_1.default.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: status,
                    updatedAt: new Date()
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
                discord_driver_1.discordDriver.execute({
                    serverId: ticket.server.discordGuildId,
                    userId: 'SYSTEM',
                    action: 'send_message',
                    params: {
                        channelId: ticket.channelId,
                        content: `**[Sistema]** O status deste ticket foi alterado para: **${statusLabels[status] || status}**.`
                    }
                });
            }
            return res.json(updatedTicket);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro ao alterar status.' });
        }
    }
    async updateTicketPriority(req, res) {
        const { id } = req.params;
        const { priority } = req.body;
        const userId = req.user?.id;
        const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'];
        if (!priority || !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ error: `Prioridade inválida. Valores aceitos: ${VALID_PRIORITIES.join(', ')}` });
        }
        try {
            const ticket = await prisma_1.default.ticket.findFirst({
                where: {
                    id: id,
                    organization: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                }
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado.' });
            }
            const updated = await prisma_1.default.ticket.update({
                where: { id: ticket.id },
                data: { priority: priority, updatedAt: new Date() }
            });
            return res.json(updated);
        }
        catch (error) {
            console.error('[TicketPriority] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao alterar prioridade.' });
        }
    }
    async deleteTicket(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
            const ticket = await prisma_1.default.ticket.findFirst({
                where: {
                    id: id,
                    organization: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                }
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }
            // Mensagens e rating são deletados em cascata pelo Prisma (onDelete: Cascade)
            await prisma_1.default.ticket.delete({
                where: { id: ticket.id }
            });
            return res.json({ message: 'Ticket deletado com sucesso.' });
        }
        catch (error) {
            console.error('[DeleteTicket] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao deletar ticket.' });
        }
    }
    async assignTicketStaff(req, res) {
        const { id } = req.params;
        const { staffId } = req.body;
        const userId = req.user?.id;
        try {
            const ticket = await prisma_1.default.ticket.findFirst({
                where: {
                    id: id,
                    organization: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                }
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado.' });
            }
            const updated = await prisma_1.default.ticket.update({
                where: { id: ticket.id },
                data: { assignedStaffId: staffId, updatedAt: new Date() }
            });
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro ao atribuir staff.' });
        }
    }
}
exports.TicketController = TicketController;
