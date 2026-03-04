import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class InternalApplicationController {
    // Lista formulários ativos para um servidor
    async getActiveForms(req: Request, res: Response) {
        const { guildId } = req.params as { guildId: string };

        try {
            const forms = await prisma.applicationForm.findMany({
                where: {
                    server: { discordGuildId: guildId },
                    status: 'ACTIVE'
                },
                include: {
                    questions: {
                        orderBy: { order: 'asc' }
                    }
                }
            });

            return res.json(forms);
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao buscar formulários.' });
        }
    }

    // Submete um formulário preenchido
    async submitApplication(req: Request, res: Response) {
        const { formId, userId, answers, discordGuildId } = req.body;

        try {
            const server = await prisma.server.findUnique({
                where: { discordGuildId },
                include: { organization: true }
            });

            if (!server) return res.status(404).json({ error: 'Servidor não encontrado.' });

            const submission = await prisma.applicationSubmission.create({
                data: {
                    organizationId: server.organizationId,
                    serverId: server.id,
                    formId,
                    userId,
                    status: 'PENDING',
                    answers: {
                        create: answers.map((a: any) => ({
                            questionId: a.questionId,
                            value: String(a.value)
                        }))
                    }
                }
            });

            return res.status(201).json(submission);
        } catch (error: any) {
            console.error(`[APPLICATION SUBMIT] ❌ Erro: ${error.message}`);
            return res.status(500).json({ error: 'Erro ao enviar formulário.' });
        }
    }
}
