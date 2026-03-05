import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

type LimitKey = 'maxServers' | 'maxStaff' | 'maxGiveaways' | 'maxTickets' | 'maxProducts';

const DEFAULT_LIMITS: Record<string, Record<LimitKey, number>> = {
    FREE: {
        maxServers: 1,
        maxStaff: 5,
        maxGiveaways: 3,
        maxTickets: 100,
        maxProducts: 5
    },
    PRO: {
        maxServers: 5,
        maxStaff: 50,
        maxGiveaways: 50,
        maxTickets: 5000,
        maxProducts: 100
    },
    ENTERPRISE: {
        maxServers: 100,
        maxStaff: 1000,
        maxGiveaways: 1000,
        maxTickets: 100000,
        maxProducts: 10000
    }
};

export const checkPlanLimit = (key: LimitKey) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        let organizationId = req.params.organizationId || req.body.organizationId || req.query.organizationId;
        const discordGuildId = req.body.discordGuildId || req.params.guildId || req.query.discordGuildId;

        // Se não temos orgId mas temos discordGuildId, buscamos a org vinculada ao servidor
        if (!organizationId && discordGuildId) {
            const server = await prisma.server.findUnique({
                where: { discordGuildId: String(discordGuildId) },
                select: { organizationId: true }
            });
            if (server) {
                organizationId = server.organizationId;
            }
        }

        if (!organizationId) {
            return res.status(400).json({ error: 'ID da organização ou Discord Guild ID é necessário para validar limites de plano.' });
        }

        try {
            const org = await prisma.organization.findUnique({
                where: { id: String(organizationId) },
                select: { plan: true, planLimits: true }
            });

            if (!org) {
                return res.status(404).json({ error: 'Organização não encontrada.' });
            }

            const plan = org.plan || 'FREE';
            const limits = (org.planLimits as any) || DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.FREE;
            const limitValue = limits[key];

            if (limitValue === undefined) {
                // Se o limite não está definido no plano, permitimos por padrão ou barramos? 
                // Vamos permitir para não quebrar fluxos não planejados.
                return next();
            }

            // Lógica de contagem baseada na chave
            let currentCount = 0;

            switch (key) {
                case 'maxServers':
                    currentCount = await prisma.server.count({ where: { organizationId: String(organizationId), isActive: true } });
                    break;
                case 'maxStaff':
                    // Contagem de membros com cargo staff nos servidores da org
                    currentCount = await prisma.staffMember.count({
                        where: { server: { organizationId: String(organizationId) } }
                    });
                    break;
                case 'maxGiveaways':
                    currentCount = await prisma.giveaway.count({
                        where: { organizationId: String(organizationId), status: 'ACTIVE' }
                    });
                    break;
                case 'maxTickets':
                    // Tickets criados no último mês (exemplo de limite de volume)
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    currentCount = await prisma.ticket.count({
                        where: { organizationId: String(organizationId), createdAt: { gte: lastMonth } }
                    });
                    break;
                case 'maxProducts':
                    currentCount = await prisma.storeProduct.count({
                        where: { organizationId: String(organizationId), status: 'ACTIVE' }
                    });
                    break;
            }

            if (currentCount >= limitValue) {
                return res.status(403).json({
                    error: `Limite do plano atingido: ${key}`,
                    limit: limitValue,
                    current: currentCount,
                    message: `Sua organização atingiu o limite de ${limitValue} para este recurso no plano ${plan}. Faça um upgrade para continuar.`
                });
            }

            next();
        } catch (error) {
            console.error(`[PLAN_LIMIT] ❌ Erro ao validar limite ${key}:`, error);
            next(); // Em caso de erro técnico, não barramos o usuário (fali-safe)
        }
    };
};
