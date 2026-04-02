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

        // ── WHITELIST QUIZ (customIds: whitelist_quiz_*, quiz_ans_*) ────────────
        if ('customId' in interaction && typeof interaction.customId === 'string' && (
            interaction.customId.startsWith('whitelist_quiz') ||
            interaction.customId.startsWith('quiz_ans_')
        )) {
            const { default: WhitelistQuizModule } = await import('../modules/automation/whitelist_quiz');
            await WhitelistQuizModule?.handleInteraction?.(interaction);
            return;
        }

        // ── WHITELIST SIMPLES (customIds: whitelist_start_*, wl_*) ──────────────
        // NOTA: whitelist_quiz_* foi tratado acima — não entra aqui
        if ('customId' in interaction && typeof interaction.customId === 'string' && (
            (interaction.customId.startsWith('whitelist_') && !interaction.customId.startsWith('whitelist_quiz')) ||
            interaction.customId.startsWith('wl_')
        )) {
            await handleSimpleWhitelist(interaction);
            return;
        }

        // ── VERIFICAÇÃO SIMPLES (customId: verification_verify) ───────────────────
        if (interaction.isButton() && interaction.customId === 'verification_verify') {
            if (!interaction.guildId) return;
            try {
                const { data: guildData } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
                const verificationModule = (guildData.modules || []).find((m: any) => m.key === 'verification');
                const advancedVerificationModule = (guildData.modules || []).find((m: any) => m.key === 'advanced_verification');
                const roleId = verificationModule?.config?.roleId
                    || verificationModule?.config?.requiredRole
                    || advancedVerificationModule?.config?.roleId
                    || advancedVerificationModule?.config?.requiredRole
                    || '';
                if (!roleId) {
                    return interaction.reply({ content: '❌ Cargo de verificação não configurado.\n\n**Como configurar:**\n1. Acesse o Dashboard → Security → Verificação Avançada\n2. Preencha o campo **"Cargo de Verificado (ID)"** com o ID do cargo do Discord\n3. Clique em **Salvar Alterações**\n4. Teste novamente este botão\n\n💡 Para copiar o ID do cargo: Discord → Configurações do Servidor → Cargos → clique direito no cargo → **Copiar ID**', ephemeral: true });
                }
                const member = await interaction.guild?.members.fetch(interaction.user.id);
                if (!member) return interaction.reply({ content: '❌ Não foi possível encontrar seu perfil no servidor.', ephemeral: true });
                if (member.roles.cache.has(roleId)) {
                    return interaction.reply({ content: '✅ Você já está verificado!', ephemeral: true });
                }
                await member.roles.add(roleId);
                const bannerUrl1 = verificationModule?.config?.bannerUrl || advancedVerificationModule?.config?.bannerUrl || '';
                const customWelcome1 = verificationModule?.config?.welcomeMessage || advancedVerificationModule?.config?.welcomeMessage || '';
                const memberCount1 = interaction.guild!.memberCount;
                const defaultDesc1 =
                    `Olá <@${interaction.user.id}> 👋\n` +
                    `» Verificação concluída com sucesso!\n` +
                    `» Você agora tem acesso ao servidor de programação.\n` +
                    `» Não esqueça de ler as regras antes de começar.\n\n` +
                    `Seja bem-vindo(a) à comunidade! Aqui você vai aprender, crescer e colaborar com outros devs. 🚀`;
                const welcomeEmbed1 = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle(`🎉 Bem-vindo(a), ${interaction.user.username}!`)
                    .setDescription(customWelcome1 || defaultDesc1)
                    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
                    .addFields({ name: '👥 Total de Membros', value: `**${memberCount1}**`, inline: true })
                    .setFooter({ text: `${interaction.guild!.name} • Verificação`, iconURL: interaction.guild!.iconURL() || undefined })
                    .setTimestamp();
                if (bannerUrl1) welcomeEmbed1.setImage(bannerUrl1);
                const replyVerif = await interaction.reply({ embeds: [welcomeEmbed1], ephemeral: false, fetchReply: true });
                setTimeout(() => replyVerif.delete().catch(() => {}), 10000);
                return;
            } catch (e: any) {
                const isMissingPerms = e.message?.includes('Missing Permissions');
                log.error('[VERIFICATION] Erro ao verificar membro: ' + e.message);
                const errMsg = isMissingPerms
                    ? '❌ Bot sem permissão para atribuir cargos. Verifique se o bot tem a permissão **Gerenciar Cargos** e se o cargo de verificação está abaixo do cargo do bot na hierarquia.'
                    : '❌ Erro ao processar verificação. Tente novamente.';
                return interaction.reply({ content: errMsg, ephemeral: true });
            }
        }

        // ── VERIFICAÇÃO AVANÇADA — CONFIRMAÇÃO (customId: advanced_verify_confirm_GUILDID) ───
        if (interaction.isButton() && interaction.customId.startsWith('advanced_verify_confirm_')) {
            if (!interaction.guildId) return;
            try {
                const { data: guildData } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
                const advModule = (guildData.modules || []).find((m: any) => m.key === 'advanced_verification');
                const verModule = (guildData.modules || []).find((m: any) => m.key === 'verification');
                const roleId = advModule?.config?.requiredRole
                    || advModule?.config?.roleId
                    || verModule?.config?.requiredRole
                    || verModule?.config?.roleId
                    || '';
                if (!roleId) {
                    return interaction.reply({ content: '❌ Cargo de verificação não configurado. Configure o campo **Required Role** em **Dashboard → Módulos → Verificação Avançada**.', ephemeral: true });
                }
                const member = await interaction.guild?.members.fetch(interaction.user.id);
                if (!member) return interaction.reply({ content: '❌ Não foi possível encontrar seu perfil no servidor.', ephemeral: true });
                if (member.roles.cache.has(roleId)) {
                    return interaction.reply({ content: '✅ Você já está verificado!', ephemeral: true });
                }
                await member.roles.add(roleId);
                const bannerUrl2 = advModule?.config?.bannerUrl || verModule?.config?.bannerUrl || '';
                const customWelcome2 = advModule?.config?.welcomeMessage || verModule?.config?.welcomeMessage || '';
                const memberCount2 = interaction.guild!.memberCount;
                const defaultDesc2 =
                    `Olá <@${interaction.user.id}> 👋\n` +
                    `» Verificação concluída com sucesso!\n` +
                    `» Você agora tem acesso ao servidor de programação.\n` +
                    `» Não esqueça de ler as regras antes de começar.\n\n` +
                    `Seja bem-vindo(a) à comunidade! Aqui você vai aprender, crescer e colaborar com outros devs. 🚀`;
                const welcomeEmbed2 = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle(`🎉 Bem-vindo(a), ${interaction.user.username}!`)
                    .setDescription(customWelcome2 || defaultDesc2)
                    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
                    .addFields({ name: '👥 Total de Membros', value: `**${memberCount2}**`, inline: true })
                    .setFooter({ text: `${interaction.guild!.name} • Verificação`, iconURL: interaction.guild!.iconURL() || undefined })
                    .setTimestamp();
                if (bannerUrl2) welcomeEmbed2.setImage(bannerUrl2);
                const replyAdv = await interaction.reply({ embeds: [welcomeEmbed2], ephemeral: false, fetchReply: true });
                setTimeout(() => replyAdv.delete().catch(() => {}), 10000);
                return;
            } catch (e: any) {
                const isMissingPerms = e.message?.includes('Missing Permissions');
                log.error('[ADV_VERIFICATION] Erro: ' + e.message);
                return interaction.reply({
                    content: isMissingPerms
                        ? '❌ Bot sem permissão para atribuir cargos. Verifique a hierarquia do cargo.'
                        : '❌ Erro ao processar verificação. Tente novamente.',
                    ephemeral: true
                });
            }
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

        // ── BOTÂO: Abrir Ticket (criado pelo /setup) ─────────────────────────────
        // customId = 'open_ticket' — Deve mostrar select de categorias ou modal direto
        if (interaction.isButton() && interaction.customId === 'open_ticket') {
            let lang = 'pt-BR';
            let categories: any[] = [];
            try {
                const { data } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
                const ticketMod = data.modules?.find((m: any) => m.key === 'ticket');
                categories = ticketMod?.config?.ticketCategories || [];
            } catch (e) { /* usa padrão */ }

            const { tickets: ticketStrings } = getTranslation(lang);

            if (categories.length === 0) {
                // Sem categorias configuradas → abre modal direto (fluxo simples)
                const modal = new ModalBuilder()
                    .setCustomId('ticket_modal_Z2VyYWw=') // base64 de "geral"
                    .setTitle(lang === 'pt-BR' ? 'Abrir Ticket' : 'Open Ticket');

                modal.addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('ticket_subject')
                            .setLabel(lang === 'pt-BR' ? 'Assunto' : 'Subject')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder(lang === 'pt-BR' ? 'Descreva brevemente o motivo' : 'Brief description')
                            .setRequired(true)
                            .setMaxLength(100)
                    ),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('ticket_description')
                            .setLabel(lang === 'pt-BR' ? 'Descrição' : 'Description')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder(lang === 'pt-BR' ? 'Explique em detalhes o que você precisa...' : 'Explain in detail...')
                            .setRequired(true)
                            .setMaxLength(800)
                    )
                );
                return interaction.showModal(modal);
            }

            // Com categorias → mostra select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('ticket_select_category')
                .setPlaceholder(ticketStrings.selectCategory)
                .addOptions(
                    categories.slice(0, 25).map((cat: any) => {
                        const isStr = typeof cat === 'string';
                        const name = isStr ? cat : (cat.name || 'Categoria');
                        return {
                            label: name,
                            value: `cat_${Buffer.from(name).toString('base64').slice(0, 50)}`,
                            description: isStr ? ticketStrings.modalTitle : (cat.description || ticketStrings.modalTitle),
                            emoji: isStr ? '🎫' : (cat.emoji || '🎫'),
                        };
                    })
                );

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
            return interaction.reply({ content: lang === 'pt-BR' ? '📂 Selecione a categoria do seu ticket:' : '📂 Select your ticket category:', components: [row], ephemeral: true });
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

                    // Validate embedColor: only pass numeric colors to avoid setColor() throwing
                    const safeColor = typeof config.embedColor === 'number'
                        ? config.embedColor
                        : (typeof config.embedColor === 'string' && /^#?[0-9a-fA-F]{6}$/.test(config.embedColor)
                            ? parseInt(config.embedColor.replace('#', ''), 16)
                            : 0x5865F2);

                    const embed = new EmbedBuilder()
                        .setTitle((config.panelTitle || ticketStrings.panelTitle).slice(0, 256))
                        .setDescription((config.panelDescription || ticketStrings.panelDesc).slice(0, 4096))
                        .setColor(safeColor);

                    // Only set image if panelBanner is a valid http/https URL
                    if (config.panelBanner && /^https?:\/\/.+/.test(config.panelBanner)) {
                        embed.setImage(config.panelBanner);
                    }

                    // Use default category if config has no categories or an empty array
                    const rawCategories = config.ticketCategories;
                    const categories = (Array.isArray(rawCategories) && rawCategories.length > 0)
                        ? rawCategories
                        : [{ name: 'Dúvidas', description: 'Atendimento geral', emoji: '🎫' }];

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('ticket_select_category')
                        .setPlaceholder(ticketStrings.selectCategory)
                        .addOptions(
                            categories.map((cat: any) => {
                                const isStr = typeof cat === 'string';
                                const name = (isStr ? cat : (cat.name || 'Suporte')) || 'Suporte';
                                const safeValue = `cat_${Buffer.from(name).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 90)}`;
                                const rawDesc = isStr
                                    ? `${ticketStrings.modalTitle} - ${name}`
                                    : (cat.description || ticketStrings.modalTitle);
                                return {
                                    label: name.slice(0, 100),
                                    value: safeValue || `cat_${Math.random().toString(36).slice(2, 12)}`,
                                    description: rawDesc.slice(0, 100),
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
                                new ButtonBuilder().setCustomId('whitelist_start_simple').setLabel('Iniciar Whitelist').setStyle(ButtonStyle.Primary)
                            ));
                        } else if (value === 'whitelist_quiz') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('whitelist_quiz_start').setLabel('Iniciar Teste').setStyle(ButtonStyle.Success)
                            ));
                        } else if (value === 'store_panel') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('store_browse').setLabel('Explorar Loja').setStyle(ButtonStyle.Success)
                            ));
                        } else if (value === 'giveaway') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('giveaway_join').setLabel('Participar do Sorteio').setStyle(ButtonStyle.Primary)
                            ));
                        } else if (value === 'application') {
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('application_start').setLabel('Preencher Formulario').setStyle(ButtonStyle.Primary)
                            ));
                        } else if (value === 'verification') {
                            const verificationModule = modulesConfig.find((m: any) => m.key === 'verification');
                            const verConfig = verificationModule?.config || {};
                            // Override embed with custom message if configured
                            if (verConfig.message) {
                                embed.setDescription(verConfig.message);
                            }
                            const btnLabel = lang === 'pt-BR' ? '✅ Verificar' : lang === 'es-ES' ? '✅ Verificar' : '✅ Verify';
                            components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId('verification_verify').setLabel(btnLabel).setStyle(ButtonStyle.Success)
                            ));
                        } else if (value === 'advanced_verification') {
                            const advModule = modulesConfig.find((m: any) => m.key === 'advanced_verification');
                            const advConfig = advModule?.config || {};
                            if (advConfig.message) {
                                embed.setDescription(advConfig.message);
                            }
                            const btnLabel = lang === 'pt-BR' ? '🤖 Verificar Conta' : lang === 'es-ES' ? '🤖 Verificar Cuenta' : '🤖 Verify Account';
                            const externalUrl = advConfig.url || advConfig.verificationUrl || '';
                            if (externalUrl) {
                                // Link para site externo + botão de confirmação para receber o cargo
                                const confirmLabel = lang === 'pt-BR' ? '✅ Já verifiquei' : lang === 'es-ES' ? '✅ Ya verifiqué' : '✅ Already verified';
                                components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                    new ButtonBuilder().setLabel(btnLabel).setStyle(ButtonStyle.Link).setURL(externalUrl),
                                    new ButtonBuilder()
                                        .setCustomId(`advanced_verify_confirm_${interaction.guildId}`)
                                        .setLabel(confirmLabel)
                                        .setStyle(ButtonStyle.Success)
                                ));
                            } else {
                                // Sem URL: botão direto que atribui o cargo
                                components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
                                    new ButtonBuilder().setCustomId('verification_verify').setLabel(btnLabel).setStyle(ButtonStyle.Success)
                                ));
                            }
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

        // ── STORE / LOJA (customIds: store_browse, store_buy_*) ──────────────────
        if ('customId' in interaction && typeof interaction.customId === 'string' && (
            interaction.customId === 'store_browse' ||
            interaction.customId.startsWith('store_buy_')
        )) {
            const { default: StoreModule } = await import('../modules/automation/store');
            await StoreModule?.handleInteraction?.(interaction);
            return;
        }

        // ── GIVEAWAY / SORTEIO (customIds: giveaway_join_*) ────────────────────
        if ('customId' in interaction && typeof interaction.customId === 'string' && (
            interaction.customId.startsWith('giveaway_join_')
        )) {
            const { default: GiveawayModule } = await import('../modules/automation/giveaway');
            await GiveawayModule?.handleInteraction?.(interaction);
            return;
        }

        // ── APPLICATION / FORMULÁRIO (customIds: application_*, app_*) ────────
        if ('customId' in interaction && typeof interaction.customId === 'string' && (
            interaction.customId === 'application_start' ||
            interaction.customId.startsWith('app_')
        )) {
            const { default: ApplicationModule } = await import('../modules/automation/application');
            await ApplicationModule?.handleInteraction?.(interaction);
            return;
        }

        // ── BOTÕES: Modulos ainda não implementados ──────────────────────────────
        // Evita timeout silencioso (This interaction failed)
        if (interaction.isButton()) {
            if (interaction.customId === 'giveaway_join') {
                await interaction.reply({ content: '🎉 Use o comando `/giveaway start` para criar um sorteio real!', ephemeral: true });
                return;
            }
            if (interaction.customId === 'application_start') {
                await interaction.reply({ content: '📥 Os formulários estão sendo atualizados. Volte logo!', ephemeral: true });
                return;
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

            try {
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

            // DM confirmation to the ticket author.
                try {
                    const dmText = lang === 'pt-BR'
                        ? `Seu ticket foi aberto com sucesso em **${guild.name}**.\nCanal: #${ticketChannel.name}\nID: ${ticketId}`
                        : lang === 'es-ES'
                            ? `Tu ticket fue abierto correctamente en **${guild.name}**.\nCanal: #${ticketChannel.name}\nID: ${ticketId}`
                            : `Your ticket was opened successfully in **${guild.name}**.\nChannel: #${ticketChannel.name}\nID: ${ticketId}`;
                    await user.send({ content: dmText });
                } catch {
                    // Ignore when user has DMs disabled.
                }

                const jumpBtn = new ButtonBuilder()
                    .setLabel(lang === 'pt-BR' ? '🎫 Ir para o Ticket' : lang === 'es-ES' ? '🎫 Ir al Ticket' : '🎫 Go to Ticket')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${guild.id}/${ticketChannel.id}`);

                const jumpRow = new ActionRowBuilder<ButtonBuilder>().addComponents(jumpBtn);

                return interaction.editReply({
                    content: ticketStrings.createdSuccess.replace('{channel}', `<#${ticketChannel.id}>`),
                    components: [jumpRow]
                });
            } catch (e: any) {
                log.error('[TICKET] Erro ao finalizar abertura do ticket: ' + (e?.message || e));
                const failMsg = lang === 'pt-BR'
                    ? '❌ Não consegui finalizar a abertura do ticket. Tente novamente.'
                    : lang === 'es-ES'
                        ? '❌ No pude finalizar la apertura del ticket. Intenta nuevamente.'
                        : '❌ I could not finish opening the ticket. Please try again.';
                return interaction.editReply({ content: failMsg });
            }
        }

        // ── BOTÂO: Fechar Ticket ───────────────────────────────────────
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

            // DM fallback when ticket is closed directly in Discord.
            try {
                const dmText = lang === 'pt-BR'
                    ? `Seu ticket (${ticketId}) foi fechado em **${interaction.guild?.name || 'OrbitUp'}**.`
                    : lang === 'es-ES'
                        ? `Tu ticket (${ticketId}) fue cerrado en **${interaction.guild?.name || 'OrbitUp'}**.`
                        : `Your ticket (${ticketId}) was closed in **${interaction.guild?.name || 'OrbitUp'}**.`;
                await interaction.user.send({ content: dmText });
            } catch {
                // Ignore when user has DMs disabled.
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
