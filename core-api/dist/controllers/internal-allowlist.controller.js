"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalAllowlistController = void 0;
const allowlist_service_1 = require("../services/domain/allowlist.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const event_bus_1 = require("../services/event-bus");
const allowlistService = new allowlist_service_1.AllowlistService();
class InternalAllowlistController {
    // GET /internal/allowlist/active-form?guildId=...
    async getActiveForm(req, res) {
        const guildId = req.query.guildId;
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
    async submitForm(req, res) {
        const { id } = req.params; // formId
        const { guildId, userId, answers } = req.body;
        if (!guildId || !userId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Faltam dados essenciais na submissão' });
        }
        const server = await prisma_1.default.server.findUnique({ where: { discordGuildId: guildId } });
        if (!server) {
            return res.status(404).json({ error: 'Servidor não encontrado' });
        }
        const form = await prisma_1.default.allowlistForm.findUnique({ where: { id: id } });
        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }
        // Verificar se usuário já tem uma submissão pending ou approved
        const existing = await prisma_1.default.allowlistSubmission.findFirst({
            where: {
                formId: id,
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
        event_bus_1.eventBus.emitEvent('allowlist.submitted', {
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
exports.InternalAllowlistController = InternalAllowlistController;
