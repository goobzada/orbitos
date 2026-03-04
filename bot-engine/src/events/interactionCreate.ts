import {
    Events,
    Interaction,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    EmbedBuilder,
} from 'discord.js';
import { log } from '../utils/logger';
import coreApi from '../utils/api-client';
import { ticketOpenedEmbed, ticketClosedEmbed } from '../utils/embeds';
import { handleAllowlistInteraction } from '../modules/allowlistV2/allowlist-flow';
import { handleSimpleWhitelist } from '../modules/simple-whitelist';
import { getTranslation, MODULE_EMOJIS } from '../utils/translations';

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        // Passa a interação para módulo Allowlist V2
        if ('customId' in interaction && typeof interaction.customId === 'string' && interaction.customId.startsWith('allowlist_')) {
            await handleAllowlistInteraction(interaction);
            return;
        }

        // Módulo Whitelist Simples (Dashboard Config)
        if ('customId' in interaction && typeof interaction.customId === 'string' && (
            interaction.customId.startsWith('whitelist_') || interaction.customId.startsWith('wl_')
        )) {
            await handleSimpleWhitelist(interaction);
            return;
        }

        // ── SLASH COMMANDS ────────────────────────────────────────────
        if (interaction.isChatInputCommand()) {
            log.event(`Slash Command: /${interaction.commandName} por ${interaction.user.tag}`);

            const command = interaction.client.commands?.get(interaction.commandName);

            if (!command) {
                log.warn(`Comando /${interaction.commandName} não encontrado.`);
                return interaction.reply({ content: '❌ Comando não encontrado.', ephemeral: true });
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                log.error(`Erro ao executar /${interaction.commandName}: ${error}`);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: '❌ Ocorreu um erro ao executar este comando!', ephemeral: true });
                } else {
                    await interaction.reply({ content: '❌ Ocorreu um erro ao executar este comando!', ephemeral: true });
                }
            }
            return;
        }

        // ── SELECT MENU: /painel deploy panel ────────────────────────
        if (interaction.isStringSelectMenu() && interaction.customId === 'painel_select_module') {
            const value = interaction.values[0];
            await interaction.deferUpdate();

            let lang = 'pt-BR';
            let modulesConfig: any[] = [];
            try {
                const { data } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
                modulesConfig = data.modules || [];
            } catch (e) { }

            const { ui, modules: moduleNames, tickets: ticketStrings } = getTranslation(lang);

            if (value === 'ticket') {
                try {
                    const ticketModule = modulesConfig.find((m: any) => m.key === 'ticket');
                    const config = ticketModule?.config || {};

                    const embed = new EmbedBuilder()
                        .setTitle(config.panelTitle || ticketStrings.panelTitle)
                        .setDescription(config.panelDescription || ticketStrings.panelDesc)
                        .setColor(config.embedColor || 0x5865F2);

                    if (config.panelBanner) embed.setImage(config.panelBanner);

                    const categories = config.ticketCategories || [{ name: 'Dúvidas', description: 'Atendimento geral', emoji: '💬' }];

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('ticket_select_category')
                        .setPlaceholder(ticketStrings.selectCategory)
                        .addOptions(
                            categories.map((cat: any) => {
                                const isStr = typeof cat === 'string';
                                const name = isStr ? cat : cat.name;
                                return {
                                    label: name || 'Category',
                                    value: `cat_${Buffer.from(name).toString('base64').slice(0, 50)}`,
                                    description: isStr ? `${ticketStrings.modalTitle} - ${name}` : (cat.description || ticketStrings.modalTitle),
                                    emoji: isStr ? '🎫' : (cat.emoji || '🎫'),
                                };
                            })
                        );

                    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

                    const channelToSend = interaction.channel;
                    if (channelToSend && 'send' in channelToSend) {
                        await channelToSend.send({ embeds: [embed], components: [row] });
                        return interaction.followUp({ content: ticketStrings.openSuccess, ephemeral: true });
                    }
                } catch (e) {
                    log.error('Erro ao enviar painel de tickets: ' + e);
                    return interaction.followUp({ content: ticketStrings.openError, ephemeral: true });
                }
            } else {
                // ── Módulos com painel genérico configurável ─────────────────
                const translation = moduleNames[value];
                if (translation) {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle(translation.name)
                            .setDescription(translation.description + '\n\nClique no botão abaixo para interagir.')
                            .setColor(0x00B0F4)
                            .setFooter({ text: `OrbitOS • ${lang}` });

                        const components: ActionRowBuilder<any>[] = [];

                        if (value === 'whitelist') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('whitelist_start_simple').setLabel('📝 Iniciar Whitelist').setStyle(ButtonStyle.Primary)
                            ));
                        } else if (value === 'whitelist_quiz') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('whitelist_quiz_start').setLabel('🛡️ Iniciar Teste').setStyle(ButtonStyle.Success)
                            ));
                        } else if (value === 'store_panel') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('store_browse').setLabel('🛒 Explorar Loja').setStyle(ButtonStyle.Success)
                            ));
                        } else if (value === 'giveaway') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('giveaway_join').setLabel('🎉 Participar do Sorteio').setStyle(ButtonStyle.Primary)
                            ));
                        } else if (value === 'application') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('application_start').setLabel('📝 Preencher Formulário').setStyle(ButtonStyle.Primary)
                            ));
                        }

                        const channelToSend = interaction.channel;
                        if (channelToSend && 'send' in channelToSend) {
                            if (components.length > 0) {
                                await channelToSend.send({ embeds: [embed], components });
                            } else {
                                await channelToSend.send({ embeds: [embed] });
                            }
                            return interaction.followUp({ content: `✅ ${translation.name} sent!`, ephemeral: true });
                        }
                    } catch (e) {
                        log.error(`Erro ao enviar painel ${value}: ` + e);
                        return interaction.followUp({ content: `❌ Error sending \`${value}\` panel.`, ephemeral: true });
                    }
                } else {
                    return interaction.followUp({
                        content: `⚠️ The module \`${value}\` is not mapped in \`${lang}\` yet.`,
                        ephemeral: true,
                    });
                }
            }
        }

        // ── SELECT MENU: Open Ticket Category ───────────────────────────────
        // CRITICO: mostrar modal IMEDIATAMENTE (sem API call — Discord tem 3s de limite)
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select_category') {
            const categoryBase64 = interaction.values[0].replace('cat_', '');
            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal_${categoryBase64}`)
                .setTitle('Abrir Ticket');

            const subjectInput = new TextInputBuilder()
                .setCustomId('ticket_subject')
                .setLabel('Assunto')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Descreva brevemente o motivo do ticket')
                .setRequired(true)
                .setMaxLength(100);

            const descInput = new TextInputBuilder()
                .setCustomId('ticket_description')
                .setLabel('Descrição')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explique em detalhes o que você precisa...')
                .setRequired(true)
                .setMaxLength(800);

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
            );

            return interaction.showModal(modal);
        }

        // ── MODAL SUBMIT: Ticket criado ────────────────────────────────
        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal')) {
            await interaction.deferReply({ ephemeral: true });

            const subject = interaction.fields.getTextInputValue('ticket_subject');
            const description = interaction.fields.getTextInputValue('ticket_description');
            const guild = interaction.guild!;
            const user = interaction.user;

            let lang = 'pt-BR';
            let config: any = {};
            try {
                const { data } = await coreApi.get(`/internal/guilds/${guild.id}/modules`);
                lang = data.language || 'pt-BR';
                const ticketModule = data.modules?.find((m: any) => m.key === 'ticket');
                config = ticketModule?.config || {};
            } catch (e) { }

            const { tickets: ticketStrings } = getTranslation(lang);

            log.event(ticketStrings.creating.replace('{user}', user.tag).replace('{subject}', subject));

            // 1. Cria canal de ticket no Discord primeiro (para ter o ID)
            const parentOpt = config.categoryId ? { parent: config.categoryId } : {};
            const ticketChannel = await guild.channels.create({
                name: ticketStrings.channelName.replace('{username}', user.username.slice(0, 10)),
                type: ChannelType.GuildText,
                ...parentOpt,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: guild.members.me!.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    ...(config.staffRoleId ? [{ id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : []),
                ]
            });

            let ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;

            // 2. Registra ticket na Core API com o channelId
            try {
                const response = await coreApi.post('/internal/tickets', {
                    serverId: guild.id,
                    discordGuildId: guild.id,
                    authorId: user.id,
                    subject,
                    description,
                    channelId: ticketChannel.id,
                    externalId: ticketId,
                    formData: JSON.stringify({
                        subject,
                        description,
                        category: Buffer.from(interaction.customId.split('_')[2], 'base64').toString()
                    })
                });
                ticketId = response.data.id || ticketId;
            } catch (e) {
                log.error('Erro ao registrar ticket na API: ' + e);
            }

            // 3. Welcome Message no canal do ticket
            const welcomeEmbed = new EmbedBuilder()
                .setTitle(ticketStrings.welcomeTitle.replace('{ticketId}', ticketId))
                .setDescription(ticketStrings.welcomeDesc
                    .replace('{user}', `<@${user.id}>`)
                    .replace('{subject}', subject)
                    .replace('{category}', Buffer.from(interaction.customId.split('_')[2], 'base64').toString())
                )
                .setColor(0x5865F2)
                .setFooter({ text: ticketStrings.footer.replace('{ticketId}', ticketId) });

            const closeBtn = new ButtonBuilder()
                .setCustomId(`close_ticket_${ticketId}`)
                .setLabel(lang === 'pt-BR' ? 'Fechar Ticket' : 'Close Ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒');

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeBtn);

            await ticketChannel.send({ content: `<@${user.id}> ${config.staffRoleId ? `<@&${config.staffRoleId}>` : ''}`, embeds: [welcomeEmbed], components: [row] });

            return interaction.editReply({ content: ticketStrings.createdSuccess.replace('{channel}', `<#${ticketChannel.id}>`) });
        }

        // ── BOTÃO: Fechar Ticket ───────────────────────────────────────
        if (interaction.isButton() && (interaction.customId.startsWith('close_ticket_') || interaction.customId.startsWith('finalize_ticket_'))) {
            const ticketId = interaction.customId.includes('close_ticket_')
                ? interaction.customId.replace('close_ticket_', '')
                : interaction.customId.replace('finalize_ticket_', '');

            await interaction.deferReply({ ephemeral: false });

            let lang = 'pt-BR';
            try {
                const { data } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
            } catch (e) { }

            try {
                await coreApi.patch(`/internal/tickets/${ticketId}/close`);
            } catch (err: any) {
                log.warn(`Erro ao fechar ticket na API: ${err.message}`);
            }

            const textChannel = interaction.channel;
            if (textChannel && 'send' in textChannel) {
                await textChannel.send({
                    embeds: [ticketClosedEmbed(lang === 'pt-BR' ? 'Equipe' : 'Staff', interaction.user.username)]
                });
            }

            const deleteMsg = lang === 'pt-BR' ? '🗑️ Canal será excluído em 5 segundos...' : lang === 'es-ES' ? '🗑️ El canal será eliminado en 5 segundos...' : '🗑️ Channel will be deleted in 5 seconds...';

            setTimeout(() => interaction.channel?.delete().catch(() => null), 5000);
            return interaction.editReply({ content: deleteMsg });
        }

        if (interaction.isButton() && interaction.customId.startsWith('assume_ticket_')) {
            await interaction.deferReply({ ephemeral: true });
            let lang = 'pt-BR';
            try {
                const { data } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
            } catch (e) { }

            const msg = lang === 'pt-BR' ? `✅ <@${interaction.user.id}> assumiu este ticket.` : `✅ <@${interaction.user.id}> assumed this ticket.`;
            return interaction.editReply({ content: msg });
        }
    }
};
