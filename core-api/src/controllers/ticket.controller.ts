import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { TicketStatus } from '@prisma/client';
import { discordDriver } from '../services/drivers/discord.driver';

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
            const result = await prisma.$transaction(async (tx) => {
                const ticket = await tx.ticket.findFirst({
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
                    throw new Error('NOT_FOUND');
                }

                const message = await tx.ticketMessage.create({
                    data: {
                        ticketId: ticket.id,
                        authorId: userId!,
                        authorName: (req.user as any)?.username || 'Staff',
                        authorAvatar: (req.user as any)?.avatar,
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

            discordDriver.execute({
                serverId: ticket.server.discordGuildId,
                userId: 'SYSTEM',
                action: 'send_message',
                params: {
                    channelId: ticket.channelId,
                    content: `**[Staff] ${message.authorName}:**\n${content}`
                }
            });

            return res.status(201).json(message);

        } catch (error: any) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }
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
                },
                include: { server: true }
            });

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }

            await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: TicketStatus.CLOSED,
                    closedAt: new Date(),
                    updatedAt: new Date()
                }
            });

            if (ticket.channelId) {
                discordDriver.execute({
                    serverId: ticket.server.discordGuildId,
                    userId: 'SYSTEM',
                    action: 'ticket.close_ticket_flow',
                    params: {
                        channelId: ticket.channelId,
                        staffName: (req.user as any)?.username || 'Staff'
                    }
                });
            }

            return res.json({ message: 'Ticket fechado com sucesso.' });

        } catch (error: any) {
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
                },
                include: { server: true }
            });

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket não encontrado ou sem permissão.' });
            }

            const updatedTicket = await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: status as TicketStatus,
                    updatedAt: new Date()
                }
            });

            if (ticket.channelId) {
                const statusLabels: Record<string, string> = {
                    OPEN: 'Aberto',
                    IN_PROGRESS: 'Em Progresso',
                    PENDING: 'Aguardando',
                    CLOSED: 'Fechado',
                    RESOLVED: 'Resolvido'
                };

                discordDriver.execute({
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
