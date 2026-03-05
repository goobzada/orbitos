import { Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonInteraction, ModalSubmitInteraction, EmbedBuilder, TextChannel, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { moduleLoader } from '../index';
import { log } from '../utils/logger';

// Salva contexto de qual form foi iniciado
const activeSessions = new Map<string, {
    questions: string[];
}>();

export async function handleSimpleWhitelist(interaction: Interaction) {
    if (interaction.isButton() && interaction.customId === 'whitelist_start_simple') {
        return handleStartButton(interaction as ButtonInteraction);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'whitelist_modal_simple') {
        return handleModalSubmit(interaction as ModalSubmitInteraction);
    }

    // Botão que os Staffs clicam para aprovar a Whitelist
    if (interaction.isButton() && interaction.customId.startsWith('wl_approve_')) {
        return handleStaffAction(interaction as ButtonInteraction, 'approve');
    }

    // Botão que os Staffs clicam para reprovar a Whitelist
    if (interaction.isButton() && interaction.customId.startsWith('wl_reject_')) {
        return handleStaffAction(interaction as ButtonInteraction, 'reject');
    }
}

async function handleStartButton(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;

    try {
        let config = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');

        const isId = config?.verificationType === 'ID';
        const isCode = config?.verificationType === 'CODE';

        if (isId) {
            config = { ...(config || {}), questions: ['Por favor, insira o seu Passaporte / ID do Jogo:'] };
        } else if (isCode) {
            config = { ...(config || {}), questions: ['Por favor, insira o seu Código de Verificação:'] };
        } else if (!config || !config.questions || config.questions.length === 0) {
            // Fallback: busca perguntas do whitelist_quiz se whitelist simples não tem
            const quizConfig = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');
            if (quizConfig && quizConfig.questions && quizConfig.questions.length > 0) {
                const simpleQuestions = quizConfig.questions.map((q: any) => q.text || q.question || q).filter(Boolean);
                config = {
                    ...quizConfig,
                    questions: simpleQuestions.slice(0, 5)
                };
            }
        }

        if (!config || !config.questions || config.questions.length === 0) {
            return interaction.reply({ content: '❌ O formulário de whitelist não está configurado corretamente.', ephemeral: true });
        }

        const questions: string[] = config.questions;

        if (questions.length > 5) {
            return interaction.reply({ content: '⚠️ O formulário possui mais de 5 perguntas, o que o Discord não permite em um único modal. Reduza no dashboard.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('whitelist_modal_simple')
            .setTitle('Solicitação de Whitelist');

        const rows = questions.map((q, index) => {
            const input = new TextInputBuilder()
                .setCustomId(`q_${index}`)
                .setLabel(q.substring(0, 45))
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            return new ActionRowBuilder<TextInputBuilder>().addComponents(input);
        });

        modal.addComponents(...rows);

        activeSessions.set(interaction.user.id, { questions });

        await interaction.showModal(modal);

    } catch (error: unknown) {
        log.error(`[SimpleWhitelist] Erro ao iniciar form: ${(error as Error).message}`);
        interaction.reply({ content: '❌ Houve um erro interno ao processar a whitelist.', ephemeral: true });
    }
}

async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    const session = activeSessions.get(interaction.user.id);

    if (!session) {
        return interaction.reply({ content: '⏳ Sua sessão expirou. Use `/wl` novamente para iniciar.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        let config = await moduleLoader.getGuildModuleConfig(interaction.guildId!, 'whitelist');
        // Fallback: pega channelId/roleId do whitelist_quiz se necessário
        if (!config || (!config.channelId && !config.roleId)) {
            const quizConfig = await moduleLoader.getGuildModuleConfig(interaction.guildId!, 'whitelist_quiz');
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
                await member.roles.add(config.roleId).catch(err => log.warn(`Failed to add role ${config.roleId} to user: ${err.message}`));
            }

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Whitelist Aprovada!')
                .setDescription('Sua whitelist foi aprovada automaticamente! Bem-vindo ao servidor.')
                .setFooter({ text: 'OrbitOS Whitelist' })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } else {
            // Enviar para canal de review (staff analisa)
            const channelId = config.channelId;
            if (channelId) {
                const reviewChannel = interaction.guild?.channels.cache.get(channelId) as TextChannel;

                if (reviewChannel && 'send' in reviewChannel) {
                    const reviewEmbed = new EmbedBuilder()
                        .setTitle('📝 Nova Solicitação de Whitelist')
                        .setDescription(
                            `**Usuário:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
                            `**ID:** \`${interaction.user.id}\`\n` +
                            `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>`
                        )
                        .setColor(0xFEE75C)
                        .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
                        .setFooter({ text: 'OrbitOS Whitelist • Aguardando análise do staff' })
                        .setTimestamp();

                    answers.forEach(item => {
                        reviewEmbed.addFields({ name: `📋 ${item.question.substring(0, 256)}`, value: item.answer.substring(0, 1024) || '*Sem resposta*' });
                    });

                    const approveBtn = new ButtonBuilder()
                        .setCustomId(`wl_approve_${interaction.user.id}`)
                        .setLabel('✅ Aprovar')
                        .setStyle(ButtonStyle.Success);

                    const rejectBtn = new ButtonBuilder()
                        .setCustomId(`wl_reject_${interaction.user.id}`)
                        .setLabel('❌ Reprovar')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, rejectBtn);

                    await reviewChannel.send({ embeds: [reviewEmbed], components: [row] });
                }
            }

            const embed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('⏳ Whitelist Enviada!')
                .setDescription(
                    'Sua whitelist foi enviada para análise da nossa equipe!\n\n' +
                    '• **Aprovado** → Você receberá o cargo automaticamente + DM de confirmação.\n' +
                    '• **Reprovado** → Você receberá uma DM e poderá tentar novamente com `/wl`.'
                )
                .setFooter({ text: 'OrbitOS Whitelist • Aguarde o resultado' })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

    } catch (error: unknown) {
        activeSessions.delete(interaction.user.id);
        log.error(`[SimpleWhitelist] Submit Error: ${(error as Error).message}`);
        return interaction.editReply({ content: '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente com `/wl`.' });
    }
}

async function handleStaffAction(interaction: ButtonInteraction, action: 'approve' | 'reject') {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '❌ Você não tem permissão para aprovar ou reprovar whitelists.', ephemeral: true });
    }

    const userId = interaction.customId.replace(action === 'approve' ? 'wl_approve_' : 'wl_reject_', '');

    await interaction.deferUpdate();

    try {
        let config = await moduleLoader.getGuildModuleConfig(interaction.guildId!, 'whitelist');
        if (!config || !config.roleId) {
            const quizConfig = await moduleLoader.getGuildModuleConfig(interaction.guildId!, 'whitelist_quiz');
            if (quizConfig) {
                config = { ...(config || {}), roleId: config?.roleId || quizConfig.roleId };
            }
        }
        const member = await interaction.guild?.members.fetch(userId).catch(() => null);

        if (action === 'approve') {
            // 1. Dar o cargo ao membro
            if (member && config.roleId) {
                await member.roles.add(config.roleId).catch(err => log.warn(`Failed to add role ${config.roleId}: ${err.message}`));
            }

            // 2. Enviar DM de aprovação
            const dmEmbed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Whitelist Aprovada!')
                .setDescription(
                    `Parabéns! Sua whitelist no servidor **${interaction.guild?.name}** foi **APROVADA**!\n\n` +
                    'Você já recebeu o cargo de acesso. Divirta-se! 🎉'
                )
                .setFooter({ text: 'OrbitOS Whitelist' })
                .setTimestamp();
            member?.send({ embeds: [dmEmbed] }).catch(() => null);

            // 3. Atualizar embed no canal de review
            const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
                .setColor(0x57F287)
                .setTitle('✅ Solicitação Aprovada')
                .setFooter({ text: `Aprovado por ${interaction.user.tag} • ${new Date().toLocaleString('pt-BR')}` });

            await interaction.editReply({ embeds: [embed], components: [] });

        } else {
            // 1. Enviar DM de reprovação (orientando a tentar novamente com /wl)
            const dmEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('❌ Whitelist Reprovada')
                .setDescription(
                    `Infelizmente sua whitelist no servidor **${interaction.guild?.name}** foi **REPROVADA**.\n\n` +
                    '📌 Você pode tentar novamente a qualquer momento usando o comando `/wl` no servidor.'
                )
                .setFooter({ text: 'OrbitOS Whitelist' })
                .setTimestamp();
            member?.send({ embeds: [dmEmbed] }).catch(() => null);

            // 2. Atualizar embed no canal de review
            const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
                .setColor(0xED4245)
                .setTitle('❌ Solicitação Reprovada')
                .setFooter({ text: `Reprovado por ${interaction.user.tag} • ${new Date().toLocaleString('pt-BR')}` });

            await interaction.editReply({ embeds: [embed], components: [] });
        }

    } catch (error: unknown) {
        log.error(`[SimpleWhitelist] Action Error: ${(error as Error).message}`);
    }
}
