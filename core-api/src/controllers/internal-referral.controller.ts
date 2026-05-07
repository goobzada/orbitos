import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class InternalReferralController {
    // Registra uma nova indicação
    async addReferral(req: Request, res: Response) {
        const { discordGuildId, referrerId, referredId } = req.body;

        try {
            const server = await prisma.server.findUnique({
                where: { discordGuildId },
                include: { organization: true }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

            // 1. Verifica se já não foi indicado antes (evitar duplicatas)
            const existing = await prisma.referral.findUnique({
                where: { referredId }
            });

            if (existing) return res.status(400).json({ error: 'Usuário já foi indicado anteriormente.' });

            // 2. Registra a indicação
            const referral = await prisma.referral.create({
                data: {
                    organizationId: server.organizationId,
                    referrerId,
                    referredId
                }
            });

            // 3. Atualiza os pontos no ranking
            await prisma.referralRanking.upsert({
                where: {
                    organizationId_userId: {
                        organizationId: server.organizationId,
                        userId: referrerId
                    }
                },
                update: {
                    points: { increment: 1 }
                },
                create: {
                    organizationId: server.organizationId,
                    userId: referrerId,
                    points: 1
                }
            });

            return res.status(201).json(referral);
        } catch (error: any) {
            console.error(`[REFERRAL ADD] ❌ Erro: ${error.message}`);
            return res.status(500).json({ error: 'Erro ao registrar indicação.' });
        }
    }

    // Busca o ranking de indicações
    async getRanking(req: Request, res: Response) {
        const { discordGuildId } = req.query;

        try {
            const server = await prisma.server.findUnique({
                where: { discordGuildId: discordGuildId as string }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

            const ranking = await prisma.referralRanking.findMany({
                where: { organizationId: server.organizationId },
                orderBy: { points: 'desc' },
                take: 10
            });

            return res.json(ranking);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar ranking.' });
        }
    }

    // Busca status de um usuário específico
    async getUserStats(req: Request, res: Response) {
        const { discordGuildId, userId } = req.query;

        try {
            const server = await prisma.server.findUnique({
                where: { discordGuildId: discordGuildId as string }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

            const stats = await prisma.referralRanking.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId: server.organizationId,
                        userId: userId as string
                    }
                }
            });

            return res.json(stats || { points: 0 });
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
        }
    }
}
