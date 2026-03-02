"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketTemplateController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class TicketTemplateController {
    async listTemplates(req, res) {
        const { serverId } = req.query;
        if (!serverId || typeof serverId !== 'string') {
            return res.status(400).json({ error: 'serverId é obrigatório' });
        }
        const templates = await prisma_1.default.ticketTemplate.findMany({
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
    async createTemplate(req, res) {
        const { serverId, name, key, title, description, isActive } = req.body;
        if (!serverId || !name || !key || !title) {
            return res.status(400).json({ error: 'Atributos ausentes.' });
        }
        const server = await prisma_1.default.server.findUnique({ where: { id: serverId } });
        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado' });
        }
        const template = await prisma_1.default.ticketTemplate.create({
            data: { serverId, organizationId: server.organizationId, name, key, title, description, isActive },
            include: { fields: true }
        });
        return res.status(201).json(template);
    }
    async updateTemplate(req, res) {
        const { id } = req.params;
        const { name, key, title, description, isActive } = req.body;
        const template = await prisma_1.default.ticketTemplate.update({
            where: { id: id },
            data: { name, key, title, description, isActive },
            include: { fields: true }
        });
        return res.json(template);
    }
}
exports.TicketTemplateController = TicketTemplateController;
