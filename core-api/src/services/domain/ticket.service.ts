import prisma from '../../lib/prisma';
import { eventBus } from '../event-bus';
import { TicketStatus } from '@prisma/client';

interface CreateTicketMessageParams {
    ticketId: string;
    organizationId: string;
    discordGuildId: string;
    discordChannelId: string | null;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    isStaff: boolean;
    authorType: string;
}

export class TicketService {
    private async dispatchDiscordAction(action: string, payload: {
        serverId: string;
        userId: string;
        params: Record<string, unknown>;
    }) {
        // The bot-engine communicates exclusively via WebSocket (no BullMQ consumer exists).
        // Broadcast directly to any connected BOT clients — this is the only reliable path.
        const { communityWSServer } = await import('../ws-server');
        communityWSServer.broadcastToTarget(payload.serverId, 'DISCORD_ACTION', {
            ...payload,
            action,
        });
    }

    async listTickets(organizationId: string) {
        const tickets = await prisma.ticket.findMany({
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

    async getTicket(ticketId: string, organizationId: string) {
        return prisma.ticket.findFirst({
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

    async addMessage(params: CreateTicketMessageParams) {
        // Criar a mensagem no banco
        const message = await prisma.ticketMessage.create({
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

    async closeTicket(ticketId: string, staffName: string) {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { server: true }
        });

        if (!ticket) throw new Error('Ticket não encontrado.');

        const updated = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                status: TicketStatus.CLOSED,
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

    async updateStatus(ticketId: string, status: TicketStatus, staffName: string) {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { server: true }
        });

        if (!ticket) throw new Error('Ticket não encontrado.');

        const updated = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                status,
                updatedAt: new Date(),
                ...(status === TicketStatus.CLOSED ? { closedAt: new Date() } : {})
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

            if (status === TicketStatus.CLOSED) {
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
            } else {
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

export const ticketService = new TicketService();
