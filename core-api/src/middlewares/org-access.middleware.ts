import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/**
 * 🔒 Organization Access Middleware – Garante que o usuário tem acesso à organização
 * 
 * Fluxo:
 *   1. Extrai organizationId do req.params, req.body ou req.query
 *   2. Se user.role === 'SUPER_ADMIN' → sempre permite
 *   3. Senão verifica OrganizationMember OU Organization.ownerId
 *   4. Se aprovado, injeta req.organizationId e req.organizationRole
 * 
 * Uso:
 *   router.get('/orgs/:organizationId/data', authMiddleware, requireOrgAccess, controller.action)
 *   router.post('/servers', authMiddleware, requireOrgAccess, controller.create)
 */
export const requireOrgAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
        res.status(401).json({ error: 'Não autenticado.' });
        return;
    }

    // SUPER_ADMIN tem acesso a tudo
    if (userRole === 'SUPER_ADMIN') {
        return next();
    }

    // Resolver organizationId de múltiplas fontes
    const organizationId =
        req.params.organizationId ||
        req.body?.organizationId ||
        req.query?.organizationId as string;

    if (!organizationId) {
        // Se não tem organizationId, tenta resolver pelo serverId
        const serverId = req.params.id || req.params.serverId || req.body?.serverId;

        if (serverId) {
            try {
                const server = await prisma.server.findUnique({
                    where: { id: serverId },
                    select: { organizationId: true, organization: { select: { ownerId: true } } }
                });

                if (!server) {
                    res.status(404).json({ error: 'Recurso não encontrado.' });
                    return;
                }

                // Verificar se é owner direto
                if (server.organization.ownerId === userId) {
                    return next();
                }

                // Verificar membership
                const membership = await prisma.organizationMember.findUnique({
                    where: { organizationId_userId: { organizationId: server.organizationId, userId } }
                });

                if (!membership) {
                    console.warn(`[ORG ACCESS] ⛔ User ${userId} tentou acessar recurso da Org ${server.organizationId} sem permissão.`);
                    res.status(403).json({ error: 'FORBIDDEN – Você não é membro desta organização.' });
                    return;
                }

                return next();
            } catch {
                res.status(500).json({ error: 'Erro ao verificar acesso.' });
                return;
            }
        }

        // Sem organizationId nem serverId — deixa o controller decidir (filtra por ownerId)
        return next();
    }

    try {
        // Verificar se é owner direto
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { ownerId: true }
        });

        if (!org) {
            res.status(404).json({ error: 'Organização não encontrada.' });
            return;
        }

        if (org.ownerId === userId) {
            return next();
        }

        // Verificar membership na tabela OrganizationMember
        const membership = await prisma.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId, userId } }
        });

        if (!membership) {
            console.warn(`[ORG ACCESS] ⛔ User ${userId} tentou acessar Org ${organizationId} sem permissão.`);
            res.status(403).json({ error: 'FORBIDDEN – Você não é membro desta organização.' });
            return;
        }

        return next();
    } catch (error) {
        console.error('[ORG ACCESS] Erro:', error);
        res.status(500).json({ error: 'Erro ao verificar acesso à organização.' });
        return;
    }
};
