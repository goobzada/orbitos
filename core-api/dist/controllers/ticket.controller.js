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
exports.TicketController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const ticket_service_1 = require("../services/domain/ticket.service");
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
            const message = await ticket_service_1.ticketService.addMessage({
                ticketId: ticket.id,
                organizationId: ticket.organizationId,
                discordGuildId: ticket.server.discordGuildId,
                discordChannelId: ticket.channelId,
                authorId: userId,
                authorName: req.user?.username || 'Staff',
                authorAvatar: req.user?.avatar,
                content,
                isStaff: true,
                authorType: 'STAFF'
            });
            return res.status(201).json(message);
        }
        catch (error) {
            console.error('[TicketController.sendTicketMessage] Error:', error.message);
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
                }
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }
            const staffName = req.user?.username || 'Staff';
            const updated = await ticket_service_1.ticketService.closeTicket(ticket.id, staffName);
            // 🔔 Avisar Dashboard em tempo real (Mantém WS broadcast aqui ou move pro Service futuramente)
            const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../services/ws-server')));
            communityWSServer.broadcastToDashboard(ticket.organizationId, 'TICKET_UPDATED', updated);
            return res.json({ message: 'Ticket fechado com sucesso.', ticket: updated });
        }
        catch (error) {
            console.error('[TicketController.closeTicket] Error:', error.message);
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
                }
            });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }
            const staffName = req.user?.username || 'Staff';
            const updatedTicket = await ticket_service_1.ticketService.updateStatus(ticket.id, status, staffName);
            // 🔔 Avisar Dashboard em tempo real
            const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../services/ws-server')));
            communityWSServer.broadcastToDashboard(ticket.organizationId, 'TICKET_UPDATED', updatedTicket);
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
