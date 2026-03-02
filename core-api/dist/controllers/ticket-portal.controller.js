"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPortalController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class TicketPortalController {
    // ─── List Portals ──────────────────────────────────────────────
    async listPortals(req, res) {
        const { serverId } = req.query;
        if (!serverId || typeof serverId !== 'string') {
            return res.status(400).json({ error: 'serverId é obrigatório' });
        }
        const portals = await prisma_1.default.ticketPortal.findMany({
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
    async createPortal(req, res) {
        const { serverId, name, description, channelId, embedColor, isActive } = req.body;
        if (!serverId || !name) {
            return res.status(400).json({ error: 'serverId e name são obrigatórios' });
        }
        const portal = await prisma_1.default.ticketPortal.create({
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
    async updatePortal(req, res) {
        const { id } = req.params;
        const { name, description, channelId, embedColor, isActive } = req.body;
        const portal = await prisma_1.default.ticketPortal.update({
            where: { id: id },
            data: { name, description, channelId, embedColor, isActive },
            include: { buttons: true }
        });
        return res.json(portal);
    }
    // ─── Delete Portal ──────────────────────────────────────────────
    async deletePortal(req, res) {
        const { id } = req.params;
        await prisma_1.default.ticketPortal.delete({ where: { id: id } });
        return res.json({ message: 'Portal deletado' });
    }
}
exports.TicketPortalController = TicketPortalController;
