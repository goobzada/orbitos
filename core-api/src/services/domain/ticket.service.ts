import prisma from '../../lib/prisma';
import { eventBus } from '../event-bus';

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

        // Emitir evento para o Bot enviar ao Discord, se for via painel (staff)
        if (params.isStaff) {
            eventBus.emitEvent('ticket.message_created', {
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
