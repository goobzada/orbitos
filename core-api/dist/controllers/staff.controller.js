"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const audit_service_1 = require("../services/domain/audit.service");
class StaffController {
    // Lista membros da staff dos servidores que pertencem às organizações do usuário logado
    async listMyStaff(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado.' });
        }
        const { serverId } = req.query;
        // 🔒 PARTE 2: Escopo Multi-Tenant estrito onde o usuário é dono ou membro
        const staffList = await prisma_1.default.staffMember.findMany({
            where: {
                serverId: serverId ? serverId : undefined,
                server: {
                    organization: {
                        OR: [
                            { ownerId: userId },
                            { members: { some: { userId } } }
                        ]
                    }
                }
            },
            include: {
                user: {
                    select: {
                        avatar: true
                    }
                }
            },
            orderBy: {
                role: 'asc'
            }
        });
        const formattedStaff = staffList.map(staff => ({
            id: staff.id,
            discordId: staff.discordUserId,
            serverId: staff.serverId,
            username: staff.username,
            avatar: staff.user?.avatar || `https://avatar.vercel.sh/${staff.username}`,
            role: staff.role,
            joinedAt: staff.createdAt.toISOString(),
            lastActive: "Hoje",
            ticketsResolved: staff.ticketsResolved,
            punishments: staff.punishments,
            avgResponseTime: "10 min"
        }));
        return res.json(formattedStaff);
    }
    // Adicionar membro staff (Vindo do Dashboard)
    async addStaffMember(req, res) {
        const userId = req.user?.id;
        const { discordUserId, username, role, serverId } = req.body;
        if (!discordUserId || !username || !role || !serverId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        try {
            // 🔒 PARTE 6: Transacional
            const result = await prisma_1.default.$transaction(async (tx) => {
                // Verifica se o servidor pertence a uma organização que o usuário pode gerenciar
                const server = await tx.server.findFirst({
                    where: {
                        id: serverId,
                        organization: {
                            OR: [
                                { ownerId: userId },
                                { members: { some: { userId } } }
                            ]
                        }
                    }
                });
                if (!server) {
                    throw new Error('FORBIDDEN');
                }
                // Criar ou Atualizar Membro
                const staff = await tx.staffMember.upsert({
                    where: {
                        serverId_discordUserId: {
                            serverId,
                            discordUserId
                        }
                    },
                    update: { username, role },
                    create: {
                        serverId,
                        discordUserId,
                        username,
                        role
                    }
                });
                return { staff, server };
            });
            const { staff, server } = result;
            // Emitir Evento (Fora da transação)
            const { eventBus } = await Promise.resolve().then(() => __importStar(require('../services/event-bus')));
            eventBus.emit('staff.added', {
                serverId: server.id,
                discordGuildId: server.discordGuildId,
                discordUserId,
                role
            });
            await audit_service_1.auditService.log({
                organizationId: server.organizationId,
                userId: userId,
                action: 'STAFF_ADDED',
                resourceType: 'StaffMember',
                resourceId: staff.id,
                metadata: { discordUserId, username, role }
            });
            return res.status(201).json(staff);
        }
        catch (error) {
            console.error('[DEBUG] Add staff error:', error);
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({ error: 'Servidor não encontrado ou sem permissão.' });
            }
            return res.status(500).json({ error: 'Erro ao adicionar membro da staff.' });
        }
    }
    async updateStaffMember(req, res) {
        const { id } = req.params;
        const { role } = req.body;
        const userId = req.user?.id;
        if (!role) {
            return res.status(400).json({ error: 'A role é obrigatória.' });
        }
        try {
            const result = await prisma_1.default.$transaction(async (tx) => {
                const staff = await tx.staffMember.findFirst({
                    where: {
                        id: id,
                        server: {
                            organization: {
                                OR: [
                                    { ownerId: userId },
                                    { members: { some: { userId } } }
                                ]
                            }
                        }
                    },
                    include: { server: true }
                });
                if (!staff) {
                    throw new Error('NOT_FOUND');
                }
                const updated = await tx.staffMember.update({
                    where: { id: id },
                    data: { role }
                });
                return { updated, server: staff.server };
            });
            await audit_service_1.auditService.log({
                organizationId: result.server.organizationId,
                userId: userId,
                action: 'STAFF_UPDATED',
                resourceType: 'StaffMember',
                resourceId: id,
                metadata: { newRole: role }
            });
            return res.json(result.updated);
        }
        catch (error) {
            console.error('[DEBUG] Update staff error:', error);
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Membro não encontrado ou sem permissão.' });
            }
            return res.status(500).json({ error: 'Erro ao atualizar membro.' });
        }
    }
    async removeStaffMember(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
            const result = await prisma_1.default.$transaction(async (tx) => {
                const staff = await tx.staffMember.findFirst({
                    where: {
                        id: id,
                        server: {
                            organization: {
                                OR: [
                                    { ownerId: userId },
                                    { members: { some: { userId } } }
                                ]
                            }
                        }
                    },
                    include: { server: true }
                });
                if (!staff) {
                    throw new Error('NOT_FOUND');
                }
                await tx.staffMember.delete({ where: { id: id } });
                return staff;
            });
            await audit_service_1.auditService.log({
                organizationId: result.server?.organizationId,
                userId: userId,
                action: 'STAFF_REMOVED',
                resourceType: 'StaffMember',
                resourceId: result.id,
                metadata: { staffDiscordId: result.discordUserId, username: result.username }
            });
            return res.json({ message: 'Membro removido com sucesso.' });
        }
        catch (error) {
            console.error('[DEBUG] Remove staff error:', error);
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Membro não encontrado ou sem permissão.' });
            }
            return res.status(500).json({ error: 'Erro ao remover membro.' });
        }
    }
}
exports.StaffController = StaffController;
