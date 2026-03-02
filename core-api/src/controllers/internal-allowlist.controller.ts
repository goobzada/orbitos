import { Request, Response } from 'express';
import { AllowlistService } from '../services/domain/allowlist.service';
import prisma from '../lib/prisma';
import { eventBus } from '../services/event-bus';

const allowlistService = new AllowlistService();

export class InternalAllowlistController {

    // GET /internal/allowlist/active-form?guildId=...
    async getActiveForm(req: Request, res: Response) {
        const guildId = req.query.guildId as string;

        if (!guildId) {
            return res.status(400).json({ error: 'guildId é obrigatório' });
        }

        const data = await allowlistService.getActiveFormByGuild(guildId);

        if (!data || !data.server) {
            return res.status(404).json({ error: 'Servidor não registrado no SaaS.' });
        }

        if (!data.form) {
            return res.status(404).json({ error: 'Nenhum formulário ativo encontrado para este servidor.' });
        }

        return res.json({ form: data.form, questions: data.form.questions });
    }

    // POST /internal/allowlist/forms/:id/submit
    async submitForm(req: Request, res: Response) {
        const { id } = req.params; // formId
        const { guildId, userId, answers } = req.body;

        if (!guildId || !userId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Faltam dados essenciais na submissão' });
        }

        const server = await prisma.server.findUnique({ where: { discordGuildId: guildId } });
        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado' });
        }

        const form = await prisma.allowlistForm.findUnique({ where: { id: id as string } });
        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        // Verificar se usuário já tem uma submissão pending ou approved
        const existing = await prisma.allowlistSubmission.findFirst({
            where: {
                formId: id as string,
                userId,
                status: { in: ['pending', 'approved'] }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Usuário já possui submissão pendente ou aprovada' });
        }

        const result = await allowlistService.submitForm({
            formId: form.id,
            organizationId: form.organizationId,
            serverId: server.id,
            userId,
            answers,
            autoApprove: form.autoApprove,
            successMessage: form.successMessage,
            rejectMessage: form.rejectMessage,
            autoRoleId: form.autoRoleId
        });

        // 🧠 Community OS: Emitir o evento para o Barramento Central do Sistema.
        eventBus.emitEvent('allowlist.submitted', {
            submission: result.submission,
            form,
            server
        });

        // Montar resposta
        return res.status(201).json({
            status: result.status,
            successMessage: result.successMessage,
            rejectMessage: result.rejectMessage,
            autoRoleId: result.autoRoleId
        });
    }
}

