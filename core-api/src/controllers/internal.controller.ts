import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { TicketStatus } from '@prisma/client';
import { moduleService } from '../services/domain/module.service';

// Rota exclusiva para o Bot Engine. Protegida por Internal Service Key (não por JWT)
export class InternalController {

    // Bot notifica quando chega em um novo servidor
    async syncGuild(req: Request, res: Response) {
        const { discordGuildId, name, icon, memberCount } = req.body;

        if (!discordGuildId || !name) {
            return res.status(400).json({ error: 'discordGuildId e name são obrigatórios.' });
        }

        const existing = await prisma.server.findUnique({ where: { discordGuildId } });

        if (!existing) {
            return res.status(404).json({
                error: 'Servidor não associado a nenhuma organização no SaaS.',
                hint: 'Adicione o servidor pelo Dashboard primeiro.'
            });
        }

        const updated = await prisma.server.update({
            where: { discordGuildId },
            data: { name, icon, isActive: true }
        });

        return res.json({ message: 'Servidor sincronizado!', server: updated });
    }

    // Bot notifica quando foi removido de um servidor
    async disconnectGuild(req: Request, res: Response) {
        const { guildId } = req.params as { guildId: string };

        const server = await prisma.server.findUnique({ where: { discordGuildId: guildId } });
        if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

        await prisma.server.update({
            where: { discordGuildId: guildId },
            data: { isActive: false }
        });

        return res.json({ message: `Servidor ${guildId} marcado como desconectado.` });
    }

    // Bot notifica quando um usuário cria um ticket no Discord
    async createTicket(req: Request, res: Response) {
        const { discordGuildId, authorId, subject, description, channelId } = req.body;

        if (!discordGuildId || !authorId || !subject) {
            return res.status(400).json({ error: 'discordGuildId, authorId e subject são obrigatórios.' });
        }

        const server = await prisma.server.findUnique({ where: { discordGuildId } });

        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado no SaaS.' });
        }

        const ticket = await prisma.ticket.create({
            data: {
                organizationId: server.organizationId,
                serverId: server.id,
                authorId,
                channelId,
                status: TicketStatus.OPEN,
            }
        });

        return res.status(201).json(ticket);
    }

    // Bot notifica quando o ticket é fechado no Discord
    async closeTicket(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        try {
            const ticket = await prisma.ticket.update({
                where: { id },
                data: { status: TicketStatus.CLOSED, closedAt: new Date() }
            });
            return res.json({ message: 'Ticket fechado!', ticket });
        } catch (error: any) {
            console.error(`[INTERNAL CLOSE] ❌ Erro ao fechar ticket ${id}: ${error.message}`);
            return res.status(500).json({ error: 'Erro ao fechar ticket. Talvez o ID seja inválido ou local.' });
        }
    }

    // Bot notifica quando uma mensagem é enviada no canal do ticket no Discord
    async receiveTicketMessage(req: Request, res: Response) {
        const { discordGuildId, channelId, content, authorId, authorName, authorAvatar, isStaff } = req.body;

        if (!discordGuildId || !channelId || !content) {
            return res.status(400).json({ error: 'discordGuildId, channelId e content são obrigatórios.' });
        }

        let ticket = await prisma.ticket.findFirst({
            where: { channelId, server: { discordGuildId } }
        });

        // 🧠 Community OS Autolink: se n\u00e3o achamos pelo canal, mas achamos um ticket ABERTO do autor sem canal vinculado...
        if (!ticket) {
            ticket = await prisma.ticket.findFirst({
                where: {
                    authorId,
                    status: TicketStatus.OPEN,
                    channelId: null,
                    server: { discordGuildId }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (ticket) {
                console.log(`[TICKET LINK] 🔗 Vinculando canal ${channelId} ao ticket ${ticket.id} automaticamente.`);
                await prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { channelId }
                });
            }
        }

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket não encontrado para este canal.' });
        }

        const message = await prisma.ticketMessage.create({
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

        await prisma.ticket.update({
            where: { id: ticket.id },
            data: { updatedAt: new Date() }
        });

        return res.status(201).json(message);
    }

    // Bot registra ação de moderação
    async logModeration(req: Request, res: Response) {
        const { discordGuildId, staffId, staffName, userId, username, reason, type, duration } = req.body;

        const server = await prisma.server.findUnique({ where: { discordGuildId }, select: { id: true, organizationId: true } });

        if (server) {
            await prisma.moderationLog.create({
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
    async memberJoin(req: Request, res: Response) {
        const { discordGuildId, userId, username } = req.body;
        // Retorna quais auto-roles aplicar (configurado no painel)
        // Por ora retorna vazio — será expandido com a tabela de configs
        return res.json({ autoRoles: [], logChannelId: null });
    }

    // Heartbeat periódico do bot
    async heartbeat(req: Request, res: Response) {
        const { guildIds, uptime, ping } = req.body;
        console.log(`[HEARTBEAT] 💓 Guilds: ${guildIds?.length || 0} | WS: ${ping}ms | Uptime: ${Math.floor(uptime / 1000)}s`);

        if (Array.isArray(guildIds) && guildIds.length > 0) {
            await prisma.server.updateMany({
                where: { discordGuildId: { in: guildIds } },
                data: { lastSeenAt: new Date(), isActive: true }
            });
        }

        return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Bot solicita configurações de módulos para um servidor específico
    async getGuildModules(req: Request, res: Response) {
        const { guildId } = req.params as { guildId: string };

        const server = await prisma.server.findUnique({
            where: { discordGuildId: guildId },
            include: { organization: true }
        }) as any;

        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado.' });
        }

        const allModules = await moduleService.listModules();
        const tenantModules = await moduleService.getTenantModules(server.organizationId);

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
            modules: result.filter(m => m.active) // Somente retornar os ativos para o bot
        });
    }
}
