import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const resolveOrgFromTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ticketId = req.params.id || req.body.ticketId;
    if (!ticketId) return next();

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { organizationId: true }
    });

    if (ticket) {
        req.query.organizationId = ticket.organizationId; // Hack to pass to requireOrgAccess
    }

    next();
};

export const resolveOrgFromServer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const serverId = req.params.id || req.params.serverId || req.body.serverId;
    if (!serverId) return next();

    const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { organizationId: true }
    });

    if (server) {
        req.query.organizationId = server.organizationId;
    }

    next();
};
