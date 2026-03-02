import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class TicketPortalController {
    // ─── List Portals ──────────────────────────────────────────────
    async listPortals(req: Request, res: Response) {
        const { serverId } = req.query;

        if (!serverId || typeof serverId !== 'string') {
            return res.status(400).json({ error: 'serverId é obrigatório' });
        }

        const portals = await prisma.ticketPortal.findMany({
            where: { serverId },
            include: {
                buttons: {
                    include: {
                        template: true
                    }
                }
            },
            orderBy: { order: 'asc' }
        });

        return res.json(portals);
    }

    // ─── Create Portal ──────────────────────────────────────────────
    async createPortal(req: Request, res: Response) {
        const { serverId, name, description, channelId, embedColor, isActive } = req.body;

        if (!serverId || !name) {
            return res.status(400).json({ error: 'serverId e name são obrigatórios' });
        }

        const portal = await prisma.ticketPortal.create({
            data: {
                serverId,
                name,
                description,
                channelId,
                embedColor: embedColor || '#5865F2',
                isActive: isActive ?? true
            },
            include: { buttons: true }
        });

        return res.status(201).json(portal);
    }

    // ─── Update Portal ──────────────────────────────────────────────
    async updatePortal(req: Request, res: Response) {
        const { id } = req.params;
        const { name, description, channelId, embedColor, isActive } = req.body;

        const portal = await prisma.ticketPortal.update({
            where: { id: id as string },
            data: { name, description, channelId, embedColor, isActive },
            include: { buttons: true }
        });

        return res.json(portal);
    }

    // ─── Delete Portal ──────────────────────────────────────────────
    async deletePortal(req: Request, res: Response) {
        const { id } = req.params;

        await prisma.ticketPortal.delete({ where: { id: id as string } });

        return res.json({ message: 'Portal deletado' });
    }
}
