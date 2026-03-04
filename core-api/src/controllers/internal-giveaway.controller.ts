import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class InternalGiveawayController {
    // Cria um novo sorteio (chamado via comando do Bot)
    async createGiveaway(req: Request, res: Response) {
        const { discordGuildId, title, prize, winnersCount, durationMinutes, authorId, channelId } = req.body;

        try {
            const server = await prisma.server.findUnique({
                where: { discordGuildId },
                include: { organization: true }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

            const endsAt = new Date(Date.now() + durationMinutes * 60000);

            const giveaway = await prisma.giveaway.create({
                data: {
                    organizationId: server.organizationId,
                    serverId: server.id,
                    title,
                    prize,
                    winnersCount: parseInt(winnersCount) || 1,
                    endsAt,
                    authorId,
                    channelId,
                    status: 'ACTIVE'
                }
            });

            return res.status(201).json(giveaway);
        } catch (error: any) {
            console.error(`[GIVEAWAY CREATE] ❌ Erro: ${error.message}`);
            return res.status(500).json({ error: 'Erro ao criar sorteio.' });
        }
    }

    // Registra participante
    async joinGiveaway(req: Request, res: Response) {
        const { giveawayId, userId, username } = req.body;

        try {
            const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId } });
            if (!giveaway || giveaway.status !== 'ACTIVE') {
                return res.status(400).json({ error: 'Sorteio não está ativo ou não existe.' });
            }

            if (new Date() > giveaway.endsAt) {
                return res.status(400).json({ error: 'Este sorteio já encerrou.' });
            }

            await prisma.giveawayParticipant.upsert({
                where: { giveawayId_userId: { giveawayId, userId } },
                update: { username },
                create: { giveawayId, userId, username }
            });

            const count = await prisma.giveawayParticipant.count({ where: { giveawayId } });

            return res.json({ message: 'Inscrito com sucesso!', participantCount: count });
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao entrar no sorteio.' });
        }
    }

    // Finaliza sorteio e escolhe ganhadores
    async endGiveaway(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const giveaway = await prisma.giveaway.findUnique({
                where: { id },
                include: { participants: true }
            });

            if (!giveaway || giveaway.status !== 'ACTIVE') {
                return res.status(400).json({ error: 'Sorteio não encontrado ou já finalizado.' });
            }

            const participants = giveaway.participants;
            if (participants.length === 0) {
                await prisma.giveaway.update({
                    where: { id },
                    data: { status: 'ENDED', winners: [] }
                });
                return res.json({ message: 'Sorteio encerrado sem participantes.', winners: [] });
            }

            // Embaralha e escolhe vencedores
            const shuffled = participants.sort(() => 0.5 - Math.random());
            const winners = shuffled.slice(0, giveaway.winnersCount).map(p => p.userId);

            const updated = await prisma.giveaway.update({
                where: { id },
                data: { status: 'ENDED', winners }
            });

            return res.json(updated);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao finalizar sorteio.' });
        }
    }

    // Lista sorteios ativos (para o bot processar timers)
    async listActiveGiveaways(req: Request, res: Response) {
        try {
            const giveaways = await prisma.giveaway.findMany({
                where: { status: 'ACTIVE' },
                include: { _count: { select: { participants: true } } }
            });
            return res.json(giveaways);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar sorteios.' });
        }
    }
}
