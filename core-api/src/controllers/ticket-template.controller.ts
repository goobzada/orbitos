import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class TicketTemplateController {
    async listTemplates(req: Request, res: Response) {
        const { serverId } = req.query;

        if (!serverId || typeof serverId !== 'string') {
            return res.status(400).json({ error: 'serverId é obrigatório' });
        }

        const templates = await prisma.ticketTemplate.findMany({
            where: { serverId },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                    include: { options: { orderBy: { order: 'asc' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(templates);
    }

    async createTemplate(req: Request, res: Response) {
        const { serverId, name, key, title, description, isActive } = req.body;

        if (!serverId || !name || !key || !title) {
            return res.status(400).json({ error: 'Atributos ausentes.' });
        }

        const server = await prisma.server.findUnique({ where: { id: serverId } });
        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado' });
        }

        const template = await prisma.ticketTemplate.create({
            data: { serverId, organizationId: server.organizationId, name, key, title, description, isActive },
            include: { fields: true }
        });

        return res.status(201).json(template);
    }

    async updateTemplate(req: Request, res: Response) {
        const { id } = req.params;
        const { name, key, title, description, isActive } = req.body;

        const template = await prisma.ticketTemplate.update({
            where: { id: id as string },
            data: { name, key, title, description, isActive },
            include: { fields: true }
        });

        return res.json(template);
    }
}
