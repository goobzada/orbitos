"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSimpleWhitelist = handleSimpleWhitelist;
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
const logger_1 = require("../utils/logger");
// Salva contexto de qual form foi iniciado
const activeSessions = new Map();
async function handleSimpleWhitelist(interaction) {
    if (interaction.isButton() && interaction.customId === 'whitelist_start_simple') {
        return handleStartButton(interaction);
    }
    if (interaction.isModalSubmit() && interaction.customId === 'whitelist_modal_simple') {
        return handleModalSubmit(interaction);
    }
    // Botão que os Staffs clicam para aprovar a Whitelist
    if (interaction.isButton() && interaction.customId.startsWith('wl_approve_')) {
        return handleStaffAction(interaction, 'approve');
    }
    // Botão que os Staffs clicam para reprovar a Whitelist
    if (interaction.isButton() && interaction.customId.startsWith('wl_reject_')) {
        return handleStaffAction(interaction, 'reject');
    }
}
async function handleStartButton(interaction) {
    if (!interaction.guildId)
        return;
    try {
        let config = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');
        const isId = config?.verificationType === 'ID';
        const isCode = config?.verificationType === 'CODE';
        if (isId) {
            config = { ...(config || {}), questions: ['Por favor, insira o seu Passaporte / ID do Jogo:'] };
        }
        else if (isCode) {
            config = { ...(config || {}), questions: ['Por favor, insira o seu Código de Verificação:'] };
        }
        else if (!config || !config.questions || config.questions.length === 0) {
            // Fallback: busca perguntas do whitelist_quiz se whitelist simples não tem
            const quizConfig = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');
            if (quizConfig && quizConfig.questions && quizConfig.questions.length > 0) {
                const simpleQuestions = quizConfig.questions.map((q) => q.text || q.question || q).filter(Boolean);
                config = {
                    ...quizConfig,
                    questions: simpleQuestions.slice(0, 5)
                };
            }
        }
        if (!config || !config.questions || config.questions.length === 0) {
            return interaction.reply({ content: '❌ O formulário de whitelist não está configurado corretamente.', ephemeral: true });
        }
        const questions = config.questions;
        if (questions.length > 5) {
            return interaction.reply({ content: '⚠️ O formulário possui mais de 5 perguntas, o que o Discord não permite em um único modal. Reduza no dashboard.', ephemeral: true });
        }
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId('whitelist_modal_simple')
            .setTitle('Solicitação de Whitelist');
        const rows = questions.map((q, index) => {
            const input = new discord_js_1.TextInputBuilder()
                .setCustomId(`q_${index}`)
                .setLabel(q.substring(0, 45))
                .setStyle(discord_js_1.TextInputStyle.Paragraph)
                .setRequired(true);
            return new discord_js_1.ActionRowBuilder().addComponents(input);
        });
        modal.addComponents(...rows);
        activeSessions.set(interaction.user.id, { questions });
        await interaction.showModal(modal);
    }
    catch (error) {
        logger_1.log.error(`[SimpleWhitelist] Erro ao iniciar form: ${error.message}`);
        interaction.reply({ content: '❌ Houve um erro interno ao processar a whitelist.', ephemeral: true });
    }
}
async function handleModalSubmit(interaction) {
    const session = activeSessions.get(interaction.user.id);
    if (!session) {
        return interaction.reply({ content: '⏳ Sua sessão expirou. Use `/wl` novamente para iniciar.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
        let config = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');
        // Fallback: pega channelId/roleId do whitelist_quiz se necessário
        if (!config || (!config.channelId && !config.roleId)) {
            const quizConfig = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');
            if (quizConfig) {
                config = { ...(config || {}), channelId: config?.channelId || quizConfig.channelId, roleId: config?.roleId || quizConfig.roleId, autoApprove: config?.autoApprove ?? quizConfig.autoApprove };
            }
        }
        const answers = session.questions.map((q, index) => {
            return {
                question: q,
                answer: interaction.fields.getTextInputValue(`q_${index}`)
            };
        });
        activeSessions.delete(interaction.user.id);
        if (config.autoApprove) {
            // Aplicar cargo diretamente (sem review)
            const member = await interaction.guild?.members.fetch(interaction.user.id);
            if (member && config.roleId) {
                await member.roles.add(config.roleId).catch(err => logger_1.log.warn(`Failed to add role ${config.roleId} to user: ${err.message}`));
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Whitelist Aprovada!')
                .setDescription('Sua whitelist foi aprovada automaticamente! Bem-vindo ao servidor.')
                .setFooter({ text: 'OrbitOS Whitelist' })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }
        else {
            // Enviar para canal de review (staff analisa)
            const channelId = config.channelId;
            if (channelId) {
                const reviewChannel = interaction.guild?.channels.cache.get(channelId);
                if (reviewChannel && 'send' in reviewChannel) {
                    const reviewEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle('📝 Nova Solicitação de Whitelist')
                        .setDescription(`**Usuário:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
                        `**ID:** \`${interaction.user.id}\`\n` +
                        `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                        .setColor(0xFEE75C)
                        .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
                        .setFooter({ text: 'OrbitOS Whitelist • Aguardando análise do staff' })
                        .setTimestamp();
                    answers.forEach(item => {
                        reviewEmbed.addFields({ name: `📋 ${item.question.substring(0, 256)}`, value: item.answer.substring(0, 1024) || '*Sem resposta*' });
                    });
                    const approveBtn = new discord_js_1.ButtonBuilder()
                        .setCustomId(`wl_approve_${interaction.user.id}`)
                        .setLabel('✅ Aprovar')
                        .setStyle(discord_js_1.ButtonStyle.Success);
                    const rejectBtn = new discord_js_1.ButtonBuilder()
                        .setCustomId(`wl_reject_${interaction.user.id}`)
                        .setLabel('❌ Reprovar')
                        .setStyle(discord_js_1.ButtonStyle.Danger);
                    const row = new discord_js_1.ActionRowBuilder().addComponents(approveBtn, rejectBtn);
                    await reviewChannel.send({ embeds: [reviewEmbed], components: [row] });
                }
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('⏳ Whitelist Enviada!')
                .setDescription('Sua whitelist foi enviada para análise da nossa equipe!\n\n' +
                '• **Aprovado** → Você receberá o cargo automaticamente + DM de confirmação.\n' +
                '• **Reprovado** → Você receberá uma DM e poderá tentar novamente com `/wl`.')
                .setFooter({ text: 'OrbitOS Whitelist • Aguarde o resultado' })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }
    }
    catch (error) {
        activeSessions.delete(interaction.user.id);
        logger_1.log.error(`[SimpleWhitelist] Submit Error: ${error.message}`);
        return interaction.editReply({ content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente com `/wl`.' });
    }
}
async function handleStaffAction(interaction, action) {
    if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '❌ Você não tem permissão para aprovar ou reprovar whitelists.', ephemeral: true });
    }
    const userId = interaction.customId.replace(action === 'approve' ? 'wl_approve_' : 'wl_reject_', '');
    await interaction.deferUpdate();
    try {
        let config = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');
        if (!config || !config.roleId) {
            const quizConfig = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');
            if (quizConfig) {
                config = { ...(config || {}), roleId: config?.roleId || quizConfig.roleId };
            }
        }
        const member = await interaction.guild?.members.fetch(userId).catch(() => null);
        if (action === 'approve') {
            // 1. Dar o cargo ao membro
            if (member && config.roleId) {
                await member.roles.add(config.roleId).catch(err => logger_1.log.warn(`Failed to add role ${config.roleId}: ${err.message}`));
            }
            // 2. Enviar DM de aprovação
            const dmEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Whitelist Aprovada!')
                .setDescription(`Parabéns! Sua whitelist no servidor **${interaction.guild?.name}** foi **APROVADA**!\n\n` +
                'Você já recebeu o cargo de acesso. Divirta-se! 🎉')
                .setFooter({ text: 'OrbitOS Whitelist' })
                .setTimestamp();
            member?.send({ embeds: [dmEmbed] }).catch(() => null);
            // 3. Atualizar embed no canal de review
            const embed = discord_js_1.EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0x57F287)
                .setTitle('✅ Solicitação Aprovada')
                .setFooter({ text: `Aprovado por ${interaction.user.tag} • ${new Date().toLocaleString('pt-BR')}` });
            await interaction.editReply({ embeds: [embed], components: [] });
        }
        else {
            // 1. Enviar DM de reprovação (orientando a tentar novamente com /wl)
            const dmEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('❌ Whitelist Reprovada')
                .setDescription(`Infelizmente sua whitelist no servidor **${interaction.guild?.name}** foi **REPROVADA**.\n\n` +
                '📌 Você pode tentar novamente a qualquer momento usando o comando `/wl` no servidor.')
                .setFooter({ text: 'OrbitOS Whitelist' })
                .setTimestamp();
            member?.send({ embeds: [dmEmbed] }).catch(() => null);
            // 2. Atualizar embed no canal de review
            const embed = discord_js_1.EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0xED4245)
                .setTitle('❌ Solicitação Reprovada')
                .setFooter({ text: `Reprovado por ${interaction.user.tag} • ${new Date().toLocaleString('pt-BR')}` });
            await interaction.editReply({ embeds: [embed], components: [] });
        }
    }
    catch (error) {
        logger_1.log.error(`[SimpleWhitelist] Action Error: ${error.message}`);
    }
}
