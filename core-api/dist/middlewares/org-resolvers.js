"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOrgFromServer = exports.resolveOrgFromTicket = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const resolveOrgFromTicket = async (req, res, next) => {
    const ticketId = req.params.id || req.body.ticketId;
    if (!ticketId)
        return next();
    const ticket = await prisma_1.default.ticket.findUnique({
        where: { id: ticketId },
        select: { organizationId: true }
    });
    if (ticket) {
        req.query.organizationId = ticket.organizationId; // Hack to pass to requireOrgAccess
    }
    next();
};
exports.resolveOrgFromTicket = resolveOrgFromTicket;
const resolveOrgFromServer = async (req, res, next) => {
    const serverId = req.params.id || req.params.serverId || req.body.serverId;
    if (!serverId)
        return next();
    const server = await prisma_1.default.server.findUnique({
        where: { id: serverId },
        select: { organizationId: true }
    });
    if (server) {
        req.query.organizationId = server.organizationId;
    }
    next();
};
exports.resolveOrgFromServer = resolveOrgFromServer;
