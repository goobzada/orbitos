import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { auditService } from '../services/domain/audit.service';

export class StaffController {
    // Lista membros da staff dos servidores que pertencem às organizações do usuário logado
    async listMyStaff(req: Request, res: Response) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado.' });
        }

        const { serverId } = req.query;

        // 🔒 PARTE 2: Escopo Multi-Tenant estrito onde o usuário é dono ou membro
        const staffList = await prisma.staffMember.findMany({
            where: {
                serverId: serverId ? (serverId as string) : undefined,
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
    async addStaffMember(req: Request, res: Response) {
        const userId = req.user?.id;
        const { discordUserId, username, role, serverId } = req.body;

        if (!discordUserId || !username || !role || !serverId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        try {
            // 🔒 PARTE 6: Transacional
            const result = await prisma.$transaction(async (tx) => {
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
            const { eventBus } = await import('../services/event-bus');
            eventBus.emit('staff.added', {
                serverId: server.id,
                discordGuildId: server.discordGuildId,
                discordUserId,
                role
            });

            await auditService.log({
                organizationId: server.organizationId,
                userId: userId as string,
                action: 'STAFF_ADDED',
                resourceType: 'StaffMember',
                resourceId: staff.id,
                metadata: { discordUserId, username, role }
            });

            return res.status(201).json(staff);

        } catch (error: any) {
            console.error('[DEBUG] Add staff error:', error);
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({ error: 'Servidor não encontrado ou sem permissão.' });
            }
            return res.status(500).json({ error: 'Erro ao adicionar membro da staff.' });
        }
    }

    async updateStaffMember(req: Request, res: Response) {
        const { id } = req.params;
        const { role } = req.body;
        const userId = req.user?.id;

        if (!role) {
            return res.status(400).json({ error: 'A role é obrigatória.' });
        }

        try {
            const result = await prisma.$transaction(async (tx) => {
                const staff = await tx.staffMember.findFirst({
                    where: {
                        id: id as string,
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
                    where: { id: id as string },
                    data: { role }
                });

                return { updated, server: staff.server };
            });

            await auditService.log({
                organizationId: result.server.organizationId,
                userId: userId as string,
                action: 'STAFF_UPDATED',
                resourceType: 'StaffMember',
                resourceId: id as string,
                metadata: { newRole: role }
            });

            return res.json(result.updated);
        } catch (error: any) {
            console.error('[DEBUG] Update staff error:', error);
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Membro não encontrado ou sem permissão.' });
            }
            return res.status(500).json({ error: 'Erro ao atualizar membro.' });
        }
    }

    async removeStaffMember(req: Request, res: Response) {
        const { id } = req.params;
        const userId = req.user?.id;

        try {
            const result = await prisma.$transaction(async (tx) => {
                const staff = await tx.staffMember.findFirst({
                    where: {
                        id: id as string,
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

                await tx.staffMember.delete({ where: { id: id as string } });
                return staff;
            });

            await auditService.log({
                organizationId: result.server?.organizationId,
                userId: userId as string,
                action: 'STAFF_REMOVED',
                resourceType: 'StaffMember',
                resourceId: result.id,
                metadata: { staffDiscordId: result.discordUserId, username: result.username }
            });

            return res.json({ message: 'Membro removido com sucesso.' });
        } catch (error: any) {
            console.error('[DEBUG] Remove staff error:', error);
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Membro não encontrado ou sem permissão.' });
            }
            return res.status(500).json({ error: 'Erro ao remover membro.' });
        }
    }
}
