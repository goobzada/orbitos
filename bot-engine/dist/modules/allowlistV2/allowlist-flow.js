"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAllowlistInteraction = handleAllowlistInteraction;
const discord_js_1 = require("discord.js");
const allowlist_api_client_1 = require("./allowlist-api-client");
const logger_1 = require("../../utils/logger");
// Maps temporary submission state. In a prod app, you might want Redis or DB, but cache in-memory is ok for now.
const activeSessions = new Map();
async function handleAllowlistInteraction(interaction) {
    if (interaction.isButton() && interaction.customId.startsWith('allowlist_start_')) {
        return handleStartButton(interaction);
    }
    if (interaction.isModalSubmit() && interaction.customId.startsWith('allowlist_modal_')) {
        return handleModalSubmit(interaction);
    }
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('allowlist_select_')) {
        // Implementação futura do captcha ou selects
    }
}
async function handleStartButton(interaction) {
    if (!interaction.guildId)
        return;
    try {
        const activeFormRes = await allowlist_api_client_1.allowlistClient.getActiveForm(interaction.guildId);
        if (!activeFormRes) {
            return interaction.reply({ content: 'Formulário inativo ou não encontrado.', ephemeral: true });
        }
        const { form, questions } = activeFormRes;
        // Limita a exibição inicial dos campos texto em um modal
        // O Discord só suporta TXT num Modal (máx 5 campos)
        const textQuestions = questions.filter(q => q.type === 'short_text' || q.type === 'long_text' || q.type === 'number');
        if (textQuestions.length > 5) {
            return interaction.reply({ content: 'O formulário tem muitas questões de texto para o Modal do Discord no momento. (Máx 5)', ephemeral: true });
        }
        if (textQuestions.length === 0) {
            return interaction.reply({ content: 'Este formulário não tem perguntas.', ephemeral: true });
        }
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(`allowlist_modal_${form.id}`)
            .setTitle(form.name.substring(0, 45));
        const rows = textQuestions.map(q => {
            const input = new discord_js_1.TextInputBuilder()
                .setCustomId(`q_${q.id}`)
                .setLabel(q.label.substring(0, 45))
                .setStyle(q.type === 'long_text' ? discord_js_1.TextInputStyle.Paragraph : discord_js_1.TextInputStyle.Short)
                .setRequired(q.required);
            if (q.placeholder) {
                input.setPlaceholder(q.placeholder.substring(0, 100));
            }
            return new discord_js_1.ActionRowBuilder().addComponents(input);
        });
        modal.addComponents(...rows);
        // Salvar sessão para as próximas validações (se tiver captchas, etc)
        activeSessions.set(interaction.user.id, {
            formId: form.id,
            questions,
            currentStep: 1,
            answers: []
        });
        await interaction.showModal(modal);
    }
    catch (error) {
        const err = error;
        logger_1.log.error(`[AllowlistFlow] Erro ao iniciar form: ${err.message}`);
        interaction.reply({ content: 'Houve um erro interno ao processar a whitelist.', ephemeral: true });
    }
}
async function handleModalSubmit(interaction) {
    const formId = interaction.customId.replace('allowlist_modal_', '');
    const session = activeSessions.get(interaction.user.id);
    if (!session || session.formId !== formId) {
        return interaction.reply({ content: 'Sua sessão de formulário expirou ou é inválida. Inicie novamente.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
        const answers = [];
        for (const question of session.questions) {
            if (question.type === 'short_text' || question.type === 'long_text' || question.type === 'number') {
                const value = interaction.fields.getTextInputValue(`q_${question.id}`);
                if (value) {
                    answers.push({ questionId: question.id, value });
                }
            }
        }
        // Send submission to API
        const payload = {
            guildId: interaction.guildId,
            userId: interaction.user.id,
            answers
        };
        const result = await allowlist_api_client_1.allowlistClient.submitAllowlist(formId, payload);
        activeSessions.delete(interaction.user.id);
        let finalMsg = '';
        if (result.status === 'approved') {
            finalMsg = result.successMessage || '✅ Parabéns! Sua whitelist foi aprovada com sucesso.';
            // TODO: Se tiver autoRoleId e permissões pro bot aplicar
        }
        else if (result.status === 'rejected') {
            finalMsg = result.rejectMessage || '❌ Infelizmente sua whitelist foi reprovada.';
        }
        else {
            finalMsg = '⏳ Sua whitelist foi enviada e está em análise. Aguarde nossos resultados.';
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(result.status === 'approved' ? 0x57F287 : result.status === 'rejected' ? 0xED4245 : 0xFEE75C)
            .setDescription(finalMsg);
        return interaction.editReply({ embeds: [embed] });
    }
    catch (error) {
        const err = error;
        logger_1.log.error(`[AllowlistFlow] Submissão Modal: ${err.message}`);
        activeSessions.delete(interaction.user.id);
        const msg = err.response?.data?.error || 'Ocorreu um erro ao submeter o formulário.';
        return interaction.editReply({ content: `❌ ${msg}` });
    }
}
