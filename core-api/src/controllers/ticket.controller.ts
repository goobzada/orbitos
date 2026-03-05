import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { TicketStatus } from '@prisma/client';
import { ticketService } from '../services/domain/ticket.service';

export class TicketController {
    // Lista todos os tickets das organizações do usuário logado
    async listMyTickets(req: Request, res: Response) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado.' });
        }

        const tickets = await prisma.ticket.findMany({
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

    async getTicket(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user?.id;

        const ticket = await prisma.ticket.findFirst({
            where: {
                id: id as string,
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

    async sendTicketMessage(req: Request, res: Response) {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;

        if (!content) {
            return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório.' });
        }

        try {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    id: id as string,
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

            const message = await ticketService.addMessage({
                ticketId: ticket.id,
                organizationId: ticket.organizationId,
                discordGuildId: ticket.server.discordGuildId,
                discordChannelId: ticket.channelId,
                authorId: userId!,
                authorName: (req.user as any)?.username || 'Staff',
                authorAvatar: (req.user as any)?.avatar,
                content,
                isStaff: true,
                authorType: 'STAFF'
            });

            return res.status(201).json(message);

        } catch (error: any) {
            console.error('[TicketController.sendTicketMessage] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
        }
    }

    async closeTicket(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user?.id;

        try {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    id: id as string,
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

            const staffName = (req.user as any)?.username || 'Staff';
            const updated = await ticketService.closeTicket(ticket.id, staffName);

            // 🔔 Avisar Dashboard em tempo real (Mantém WS broadcast aqui ou move pro Service futuramente)
            const { communityWSServer } = await import('../services/ws-server');
            communityWSServer.broadcastToDashboard(ticket.organizationId, 'TICKET_UPDATED', updated);

            return res.json({ message: 'Ticket fechado com sucesso.', ticket: updated });

        } catch (error: any) {
            console.error('[TicketController.closeTicket] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao fechar o ticket.' });
        }
    }

    async updateTicketStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        if (!status || !Object.values(TicketStatus).includes(status as TicketStatus)) {
            return res.status(400).json({ error: 'Status inválido.' });
        }

        try {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    id: id as string,
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

            const staffName = (req.user as any)?.username || 'Staff';
            const updatedTicket = await ticketService.updateStatus(ticket.id, status as TicketStatus, staffName);

            // 🔔 Avisar Dashboard em tempo real
            const { communityWSServer } = await import('../services/ws-server');
            communityWSServer.broadcastToDashboard(ticket.organizationId, 'TICKET_UPDATED', updatedTicket);

            return res.json(updatedTicket);

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao alterar status.' });
        }
    }

    async updateTicketPriority(req: Request, res: Response) {
        const { id } = req.params;
        const { priority } = req.body;
        const userId = req.user?.id;

        const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'];
        if (!priority || !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ error: `Prioridade inválida. Valores aceitos: ${VALID_PRIORITIES.join(', ')}` });
        }

        try {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    id: id as string,
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

            const updated = await prisma.ticket.update({
                where: { id: ticket.id },
                data: { priority: priority as any, updatedAt: new Date() }
            });

            return res.json(updated);
        } catch (error: any) {
            console.error('[TicketPriority] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao alterar prioridade.' });
        }
    }

    async deleteTicket(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user?.id;

        try {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    id: id as string,
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
            await prisma.ticket.delete({
                where: { id: ticket.id }
            });

            return res.json({ message: 'Ticket deletado com sucesso.' });
        } catch (error: any) {
            console.error('[DeleteTicket] Error:', error.message);
            return res.status(500).json({ error: 'Erro ao deletar ticket.' });
        }
    }

    async assignTicketStaff(req: Request, res: Response) {
        const { id } = req.params;
        const { staffId } = req.body;
        const userId = req.user?.id;

        try {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    id: id as string,
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

            const updated = await prisma.ticket.update({
                where: { id: ticket.id },
                data: { assignedStaffId: staffId, updatedAt: new Date() }
            });

            return res.json(updated);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atribuir staff.' });
        }
    }
}
