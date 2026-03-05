import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { eventBus } from '../services/event-bus';

// Helper para garantir string simples do req.params
const str = (v: string | string[]): string => Array.isArray(v) ? v[0] : v;

export class AutomationController {

    async list(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);

        const automations = await prisma.automation.findMany({
            where: { organizationId },
            include: {
                logs: { take: 1, orderBy: { createdAt: 'desc' } },
                _count: { select: { logs: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(automations);
    }

    async getById(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);
        const id = str(req.params.id);

        const automation = await prisma.automation.findFirst({
            where: { id, organizationId },
            include: { logs: { take: 10, orderBy: { createdAt: 'desc' } } }
        });

        if (!automation) return res.status(404).json({ error: 'Automação não encontrada.' });
        return res.json(automation);
    }

    async create(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);
        const { name, description, serverId, trigger, conditions, actions, isActive = true } = req.body;

        if (!name || !serverId || !trigger || !actions) {
            return res.status(400).json({ error: 'name, serverId, trigger e actions são obrigatórios.' });
        }

        try {
            const server = await prisma.server.findFirst({
                where: { id: String(serverId), organizationId }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado nessa organização.' });

            const automation = await prisma.automation.create({
                data: {
                    organizationId,
                    serverId: String(serverId),
                    name,
                    description,
                    trigger,
                    conditions: conditions ? JSON.stringify(conditions) : null,
                    actions: JSON.stringify(actions),
                    isActive
                }
            });

            return res.status(201).json(automation);
        } catch (error: any) {
            console.error('[AUTOMATION CREATE]', error.message);
            return res.status(500).json({ error: 'Erro ao criar automação.' });
        }
    }

    async update(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);
        const id = str(req.params.id);
        const { name, description, trigger, conditions, actions, isActive } = req.body;

        try {
            const existing = await prisma.automation.findFirst({ where: { id, organizationId } });
            if (!existing) return res.status(404).json({ error: 'Automação não encontrada.' });

            const automation = await prisma.automation.update({
                where: { id },
                data: {
                    ...(name !== undefined && { name }),
                    ...(description !== undefined && { description }),
                    ...(trigger !== undefined && { trigger }),
                    ...(conditions !== undefined && { conditions: JSON.stringify(conditions) }),
                    ...(actions !== undefined && { actions: JSON.stringify(actions) }),
                    ...(isActive !== undefined && { isActive }),
                    updatedAt: new Date()
                }
            });

            return res.json(automation);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao atualizar automação.' });
        }
    }

    async toggle(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);
        const id = str(req.params.id);

        const existing = await prisma.automation.findFirst({ where: { id, organizationId } });
        if (!existing) return res.status(404).json({ error: 'Automação não encontrada.' });

        const updated = await prisma.automation.update({
            where: { id },
            data: { isActive: !existing.isActive }
        });

        return res.json(updated);
    }

    async deleteOne(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);
        const id = str(req.params.id);

        const existing = await prisma.automation.findFirst({ where: { id, organizationId } });
        if (!existing) return res.status(404).json({ error: 'Automação não encontrada.' });

        await prisma.automation.delete({ where: { id } });
        return res.json({ message: 'Automação removida com sucesso.' });
    }

    async getLogs(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);
        const id = str(req.params.id);
        const limit = Math.min(Number(req.query.limit) || 20, 100);

        const logs = await prisma.automationLog.findMany({
            where: { organizationId, automationId: id },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return res.json(logs);
    }

    async testFire(req: Request, res: Response) {
        const organizationId = str(req.params.organizationId);
        const id = str(req.params.id);

        const automation = await prisma.automation.findFirst({ where: { id, organizationId } });
        if (!automation) return res.status(404).json({ error: 'Automação não encontrada.' });

        eventBus.emitEvent(automation.trigger, {
            organizationId,
            serverId: automation.serverId,
            _testMode: true,
            _automationId: id
        });

        return res.json({ message: `Evento de teste '${automation.trigger}' disparado com sucesso.` });
    }

    async getAvailableTriggers(req: Request, res: Response) {
        const TRIGGERS = [
            { group: 'Discord', value: 'member.joined', label: 'Membro entrou no servidor', fields: ['userId', 'username', 'serverId'] },
            { group: 'Discord', value: 'member.left', label: 'Membro saiu do servidor', fields: ['userId', 'username', 'serverId'] },
            { group: 'Discord', value: 'member.banned', label: 'Membro foi banido', fields: ['userId', 'username', 'reason', 'moderatorId'] },
            { group: 'Discord', value: 'message.created', label: 'Mensagem enviada', fields: ['userId', 'channelId', 'content'] },
            { group: 'Tickets', value: 'ticket.created', label: 'Ticket aberto', fields: ['ticketId', 'authorId', 'subject', 'organizationId'] },
            { group: 'Tickets', value: 'ticket.closed', label: 'Ticket fechado', fields: ['ticketId', 'staffId', 'organizationId'] },
            { group: 'Tickets', value: 'ticket.message', label: 'Mensagem no ticket', fields: ['ticketId', 'authorId', 'content'] },
            { group: 'Allowlist', value: 'allowlist.approved', label: 'Allowlist aprovada', fields: ['userId', 'formId', 'organizationId'] },
            { group: 'Allowlist', value: 'allowlist.rejected', label: 'Allowlist rejeitada', fields: ['userId', 'formId', 'reason'] },
            { group: 'Giveaways', value: 'giveaway.ended', label: 'Sorteio encerrado', fields: ['giveawayId', 'winners', 'organizationId'] },
            { group: 'Giveaways', value: 'giveaway.joined', label: 'Usuário entrou no sorteio', fields: ['giveawayId', 'userId'] },
            { group: 'Loja', value: 'store.order.paid', label: 'Compra confirmada', fields: ['orderId', 'userId', 'totalCents', 'organizationId'] },
            { group: 'Plataforma', value: 'org.plan.upgraded', label: 'Plano atualizado', fields: ['organizationId', 'plan'] },
        ];

        return res.json(TRIGGERS);
    }

    async getAvailableActions(req: Request, res: Response) {
        const ACTIONS = [
            { group: 'Discord', value: 'discord.send_message', label: 'Enviar Mensagem', driver: 'discord', type: 'send_message', params: ['channelId', 'content'] },
            { group: 'Discord', value: 'discord.add_role', label: 'Adicionar Cargo', driver: 'discord', type: 'add_role', params: ['userId', 'roleId'] },
            { group: 'Discord', value: 'discord.remove_role', label: 'Remover Cargo', driver: 'discord', type: 'remove_role', params: ['userId', 'roleId'] },
            { group: 'Discord', value: 'discord.kick_user', label: 'Expulsar Usuário', driver: 'discord', type: 'kick_user', params: ['userId', 'reason'] },
            { group: 'Discord', value: 'discord.ban_user', label: 'Banir Usuário', driver: 'discord', type: 'ban_user', params: ['userId', 'reason'] },
            { group: 'Discord', value: 'discord.create_thread', label: 'Criar Thread', driver: 'discord', type: 'create_thread', params: ['channelId', 'name', 'content'] },
            { group: 'Tickets', value: 'ticket.close', label: 'Fechar Ticket', driver: 'discord', type: 'ticket.close_ticket_flow', params: ['channelId', 'staffName'] },
            { group: 'Integrações', value: 'http.post', label: 'Webhook HTTP POST', driver: 'http', type: 'http_post', params: ['url', 'body'] },
        ];

        return res.json(ACTIONS);
    }
}

export const automationController = new AutomationController();
