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
        const config = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');

        if (!config || !config.questions || config.questions.length === 0) {
            return interaction.reply({ content: 'O formulário de whitelist não está configurado corretamente.', ephemeral: true });
        }

        const questions: string[] = config.questions;

        if (questions.length > 5) {
            return interaction.reply({ content: 'O formulário possui mais de 5 perguntas, o que o Discord não permite em um único modal. Reduza no dashboard.', ephemeral: true });
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
        interaction.reply({ content: 'Houve um erro interno ao processar a whitelist.', ephemeral: true });
    }
}

async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    const session = activeSessions.get(interaction.user.id);

    if (!session) {
        return interaction.reply({ content: 'Sua sessão expirou. Inicie novamente clicando no botão do formulário.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
        const config = await moduleLoader.getGuildModuleConfig(interaction.guildId!, 'whitelist');

        const answers = session.questions.map((q, index) => {
            return {
                question: q,
                answer: interaction.fields.getTextInputValue(`q_${index}`)
            };
        });

        activeSessions.delete(interaction.user.id);

        if (config.autoApprove) {
            // Apply role immediately
            const member = await interaction.guild?.members.fetch(interaction.user.id);
            if (member && config.roleId) {
                await member.roles.add(config.roleId).catch(err => log.warn(`Failed to add role ${config.roleId} to user: ${err.message}`));
            }

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setDescription('✅ **Sua whitelist foi aprovada automaticamente!** Bem-vindo ao servidor.');

            return interaction.editReply({ embeds: [embed] });

        } else {
            // Send to review channel
            const channelId = config.channelId;
            if (channelId) {
                const reviewChannel = interaction.guild?.channels.cache.get(channelId) as TextChannel;

                if (reviewChannel && 'send' in reviewChannel) {
                    const reviewEmbed = new EmbedBuilder()
                        .setTitle(`📝 Nova Solicitação de Whitelist`)
                        .setDescription(`Usuário: <@${interaction.user.id}> (${interaction.user.tag})`)
                        .setColor(0xFEE75C);

                    answers.forEach(item => {
                        reviewEmbed.addFields({ name: item.question.substring(0, 256), value: item.answer.substring(0, 1024) });
                    });

                    const approveBtn = new ButtonBuilder()
                        .setCustomId(`wl_approve_${interaction.user.id}`)
                        .setLabel('Aprovar')
                        .setStyle(ButtonStyle.Success);

                    const rejectBtn = new ButtonBuilder()
                        .setCustomId(`wl_reject_${interaction.user.id}`)
                        .setLabel('Reprovar')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(approveBtn, rejectBtn);

                    await reviewChannel.send({ embeds: [reviewEmbed], components: [row] });
                }
            }

            const embed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setDescription('⏳ **Sua whitelist foi enviada para análise da nossa equipe!** Aguarde os resultados.');

            return interaction.editReply({ embeds: [embed] });
        }

    } catch (error: unknown) {
        activeSessions.delete(interaction.user.id);
        log.error(`[SimpleWhitelist] Submit Error: ${(error as Error).message}`);
        return interaction.editReply({ content: `❌ Ocorreu um erro ao processar sua solicitação.` });
    }
}

async function handleStaffAction(interaction: ButtonInteraction, action: 'approve' | 'reject') {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '❌ Você não tem permissão para aprovar ou reprovar whitelists.', ephemeral: true });
    }

    const userId = interaction.customId.replace(action === 'approve' ? 'wl_approve_' : 'wl_reject_', '');

    await interaction.deferUpdate();

    try {
        const config = await moduleLoader.getGuildModuleConfig(interaction.guildId!, 'whitelist');
        const member = await interaction.guild?.members.fetch(userId).catch(() => null);

        if (action === 'approve') {
            if (member && config.roleId) {
                await member.roles.add(config.roleId).catch(err => log.warn(`Failed to add role ${config.roleId}: ${err.message}`));
            }

            // Tenta enviar DM para o usuário
            member?.send('✅ **Parabéns! Sua whitelist foi APROVADA** no servidor!').catch(() => null);

            const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
                .setColor(0x57F287) // Verde
                .setTitle('✅ Solicitação Aprovada')
                .setFooter({ text: `Aprovado por ${interaction.user.tag}` });

            await interaction.editReply({ embeds: [embed], components: [] });

        } else {
            // Tenta enviar DM para o usuário
            member?.send('❌ **Infelizmente sua whitelist foi REPROVADA**. Tente novamente mais tarde.').catch(() => null);

            const embed = EmbedBuilder.from(interaction.message.embeds[0]!)
                .setColor(0xED4245) // Vermelho
                .setTitle('❌ Solicitação Reprovada')
                .setFooter({ text: `Reprovado por ${interaction.user.tag}` });

            await interaction.editReply({ embeds: [embed], components: [] });
        }

    } catch (error: unknown) {
        log.error(`[SimpleWhitelist] Action Error: ${(error as Error).message}`);
    }
}
