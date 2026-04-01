"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../utils/logger");
const api_client_1 = __importDefault(require("../utils/api-client"));
const embeds_1 = require("../utils/embeds");
const allowlist_flow_1 = require("../modules/allowlistV2/allowlist-flow");
const simple_whitelist_1 = require("../modules/simple-whitelist");
const translations_1 = require("../utils/translations");
exports.default = {
    name: discord_js_1.Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // Passa a intera├º├úo para m├│dulo Allowlist V2
        if ('customId' in interaction && typeof interaction.customId === 'string' && interaction.customId.startsWith('allowlist_')) {
            await (0, allowlist_flow_1.handleAllowlistInteraction)(interaction);
            return;
        }
        // ΓöÇΓöÇ WHITELIST QUIZ (customIds: whitelist_quiz_*, quiz_ans_*) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if ('customId' in interaction && typeof interaction.customId === 'string' && (interaction.customId.startsWith('whitelist_quiz') ||
            interaction.customId.startsWith('quiz_ans_'))) {
            const { default: WhitelistQuizModule } = await Promise.resolve().then(() => __importStar(require('../modules/automation/whitelist_quiz')));
            await WhitelistQuizModule?.handleInteraction?.(interaction);
            return;
        }
        // ΓöÇΓöÇ WHITELIST SIMPLES (customIds: whitelist_start_*, wl_*) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        // NOTA: whitelist_quiz_* foi tratado acima ΓÇö n├úo entra aqui
        if ('customId' in interaction && typeof interaction.customId === 'string' && ((interaction.customId.startsWith('whitelist_') && !interaction.customId.startsWith('whitelist_quiz')) ||
            interaction.customId.startsWith('wl_'))) {
            await (0, simple_whitelist_1.handleSimpleWhitelist)(interaction);
            return;
        }
        // ΓöÇΓöÇ VERIFICA├ç├âO SIMPLES (customId: verification_verify) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if (interaction.isButton() && interaction.customId === 'verification_verify') {
            if (!interaction.guildId)
                return;
            try {
                const { data: guildData } = await api_client_1.default.get(`/internal/guilds/${interaction.guildId}/modules`);
                const verificationModule = (guildData.modules || []).find((m) => m.key === 'verification');
                const roleId = verificationModule?.config?.roleId;
                if (!roleId) {
                    return interaction.reply({ content: 'Γ¥î Papel de verifica├º├úo n├úo configurado. Contate um administrador.', ephemeral: true });
                }
                const member = await interaction.guild?.members.fetch(interaction.user.id);
                if (!member)
                    return interaction.reply({ content: 'Γ¥î N├úo foi poss├¡vel encontrar seu perfil no servidor.', ephemeral: true });
                if (member.roles.cache.has(roleId)) {
                    return interaction.reply({ content: 'Γ£à Voc├¬ j├í est├í verificado!', ephemeral: true });
                }
                await member.roles.add(roleId);
                return interaction.reply({ content: 'Γ£à Verifica├º├úo conclu├¡da! Bem-vindo ao servidor.', ephemeral: true });
            }
            catch (e) {
                const isMissingPerms = e.message?.includes('Missing Permissions');
                logger_1.log.error('[VERIFICATION] Erro ao verificar membro: ' + e.message);
                const errMsg = isMissingPerms
                    ? 'Γ¥î Bot sem permiss├úo para atribuir cargos. Verifique se o bot tem a permiss├úo **Gerenciar Cargos** e se o cargo de verifica├º├úo est├í abaixo do cargo do bot na hierarquia.'
                    : 'Γ¥î Erro ao processar verifica├º├úo. Tente novamente.';
                return interaction.reply({ content: errMsg, ephemeral: true });
            }
        }
        // ΓöÇΓöÇ SLASH COMMANDS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if (interaction.isChatInputCommand()) {
            logger_1.log.event(`Slash Command: /${interaction.commandName} por ${interaction.user.tag}`);
            const command = interaction.client.commands?.get(interaction.commandName);
            if (!command) {
                logger_1.log.warn(`Comando /${interaction.commandName} n├úo encontrado.`);
                return interaction.reply({ content: 'Γ¥î Comando n├úo encontrado.', ephemeral: true });
            }
            try {
                await command.execute(interaction);
            }
            catch (error) {
                logger_1.log.error(`Erro ao executar /${interaction.commandName}: ${error}`);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Γ¥î Ocorreu um erro ao executar este comando!', ephemeral: true });
                }
                else {
                    await interaction.reply({ content: 'Γ¥î Ocorreu um erro ao executar este comando!', ephemeral: true });
                }
            }
            return;
        }
        // ΓöÇΓöÇ BOT├âO: Abrir Ticket (criado pelo /setup) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        // customId = 'open_ticket' ΓÇö Deve mostrar select de categorias ou modal direto
        if (interaction.isButton() && interaction.customId === 'open_ticket') {
            let lang = 'pt-BR';
            let categories = [];
            try {
                const { data } = await api_client_1.default.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
                const ticketMod = data.modules?.find((m) => m.key === 'ticket');
                categories = ticketMod?.config?.ticketCategories || [];
            }
            catch (e) { /* usa padr├úo */ }
            const { tickets: ticketStrings } = (0, translations_1.getTranslation)(lang);
            if (categories.length === 0) {
                // Sem categorias configuradas ΓåÆ abre modal direto (fluxo simples)
                const modal = new discord_js_1.ModalBuilder()
                    .setCustomId('ticket_modal_Z2VyYWw=') // base64 de "geral"
                    .setTitle(lang === 'pt-BR' ? 'Abrir Ticket' : 'Open Ticket');
                modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                    .setCustomId('ticket_subject')
                    .setLabel(lang === 'pt-BR' ? 'Assunto' : 'Subject')
                    .setStyle(discord_js_1.TextInputStyle.Short)
                    .setPlaceholder(lang === 'pt-BR' ? 'Descreva brevemente o motivo' : 'Brief description')
                    .setRequired(true)
                    .setMaxLength(100)), new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                    .setCustomId('ticket_description')
                    .setLabel(lang === 'pt-BR' ? 'Descri├º├úo' : 'Description')
                    .setStyle(discord_js_1.TextInputStyle.Paragraph)
                    .setPlaceholder(lang === 'pt-BR' ? 'Explique em detalhes o que voc├¬ precisa...' : 'Explain in detail...')
                    .setRequired(true)
                    .setMaxLength(800)));
                return interaction.showModal(modal);
            }
            // Com categorias ΓåÆ mostra select menu
            const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                .setCustomId('ticket_select_category')
                .setPlaceholder(ticketStrings.selectCategory)
                .addOptions(categories.slice(0, 25).map((cat) => {
                const isStr = typeof cat === 'string';
                const name = isStr ? cat : (cat.name || 'Categoria');
                return {
                    label: name,
                    value: `cat_${Buffer.from(name).toString('base64').slice(0, 50)}`,
                    description: isStr ? ticketStrings.modalTitle : (cat.description || ticketStrings.modalTitle),
                    emoji: isStr ? '≡ƒÄ½' : (cat.emoji || '≡ƒÄ½'),
                };
            }));
            const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
            return interaction.reply({ content: lang === 'pt-BR' ? '≡ƒôé Selecione a categoria do seu ticket:' : '≡ƒôé Select your ticket category:', components: [row], ephemeral: true });
        }
        // ΓöÇΓöÇ SELECT MENU: /painel deploy panel ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if (interaction.isStringSelectMenu() && interaction.customId === 'painel_select_module') {
            const value = interaction.values[0];
            await interaction.deferUpdate();
            let lang = 'pt-BR';
            let modulesConfig = [];
            try {
                const { data } = await api_client_1.default.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
                modulesConfig = data.modules || [];
            }
            catch (e) { }
            const { ui, modules: moduleNames, tickets: ticketStrings } = (0, translations_1.getTranslation)(lang);
            if (value === 'ticket') {
                try {
                    const ticketModule = modulesConfig.find((m) => m.key === 'ticket');
                    const config = ticketModule?.config || {};
                    // Validate embedColor: only pass numeric colors to avoid setColor() throwing
                    const safeColor = typeof config.embedColor === 'number'
                        ? config.embedColor
                        : (typeof config.embedColor === 'string' && /^#?[0-9a-fA-F]{6}$/.test(config.embedColor)
                            ? parseInt(config.embedColor.replace('#', ''), 16)
                            : 0x5865F2);
                    const embed = new discord_js_1.EmbedBuilder()
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
                    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                        .setCustomId('ticket_select_category')
                        .setPlaceholder(ticketStrings.selectCategory)
                        .addOptions(categories.map((cat) => {
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
                    }));
                    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
                    const channelToSend = interaction.channel;
                    if (channelToSend && 'send' in channelToSend) {
                        await channelToSend.send({ embeds: [embed], components: [row] });
                        return interaction.followUp({ content: ticketStrings.openSuccess, ephemeral: true });
                    }
                }
                catch (e) {
                    logger_1.log.error('Erro ao enviar painel de tickets: ' + e);
                    return interaction.followUp({ content: ticketStrings.openError, ephemeral: true });
                }
            }
            else {
                // ΓöÇΓöÇ M├│dulos com painel gen├⌐rico configur├ível ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
                const translation = moduleNames[value];
                if (translation) {
                    try {
                        const embed = new discord_js_1.EmbedBuilder()
                            .setTitle(translation.name)
                            .setDescription(translation.description + '\n\nClique no botao abaixo para interagir.')
                            .setColor(0x00B0F4)
                            .setFooter({ text: `OrbitOS • ${lang}` });
                        const components = [];
                        if (value === 'whitelist') {
                            components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('whitelist_start_simple').setLabel('Iniciar Whitelist').setStyle(discord_js_1.ButtonStyle.Primary)));
                        }
                        else if (value === 'whitelist_quiz') {
                            components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('whitelist_quiz_start').setLabel('Iniciar Teste').setStyle(discord_js_1.ButtonStyle.Success)));
                        }
                        else if (value === 'store_panel') {
                            components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('store_browse').setLabel('Explorar Loja').setStyle(discord_js_1.ButtonStyle.Success)));
                        }
                        else if (value === 'giveaway') {
                            components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('giveaway_join').setLabel('Participar do Sorteio').setStyle(discord_js_1.ButtonStyle.Primary)));
                        }
                        else if (value === 'application') {
                            components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('application_start').setLabel('Preencher Formulario').setStyle(discord_js_1.ButtonStyle.Primary)));
                        }
                        else if (value === 'verification') {
                            const verificationModule = modulesConfig.find((m) => m.key === 'verification');
                            const verConfig = verificationModule?.config || {};
                            // Override embed with custom message if configured
                            if (verConfig.message) {
                                embed.setDescription(verConfig.message);
                            }
                            const btnLabel = lang === 'pt-BR' ? 'Γ£à Verificar' : lang === 'es-ES' ? 'Γ£à Verificar' : 'Γ£à Verify';
                            components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('verification_verify').setLabel(btnLabel).setStyle(discord_js_1.ButtonStyle.Success)));
                        }
                        else if (value === 'advanced_verification') {
                            const advModule = modulesConfig.find((m) => m.key === 'advanced_verification');
                            const advConfig = advModule?.config || {};
                            if (advConfig.message) {
                                embed.setDescription(advConfig.message);
                            }
                            const btnLabel = lang === 'pt-BR' ? '≡ƒöÉ Verificar Conta' : lang === 'es-ES' ? '≡ƒöÉ Verificar Cuenta' : '≡ƒöÉ Verify Account';
                            // If an external URL is configured, use a Link button; otherwise use role-assign button
                            const externalUrl = advConfig.url || advConfig.verificationUrl || '';
                            if (externalUrl) {
                                components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel(btnLabel).setStyle(discord_js_1.ButtonStyle.Link).setURL(externalUrl)));
                            }
                            else {
                                components.push(new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('verification_verify').setLabel(btnLabel).setStyle(discord_js_1.ButtonStyle.Success)));
                            }
                        }
                        const channelToSend = interaction.channel;
                        if (channelToSend && 'send' in channelToSend) {
                            if (components.length > 0) {
                                await channelToSend.send({ embeds: [embed], components });
                            }
                            else {
                                await channelToSend.send({ embeds: [embed] });
                            }
                            return interaction.followUp({ content: `Γ£à ${translation.name} sent!`, ephemeral: true });
                        }
                    }
                    catch (e) {
                        logger_1.log.error(`Erro ao enviar painel ${value}: ` + e);
                        return interaction.followUp({ content: `Γ¥î Error sending \`${value}\` panel.`, ephemeral: true });
                    }
                }
                else {
                    return interaction.followUp({
                        content: `ΓÜá∩╕Å The module \`${value}\` is not mapped in \`${lang}\` yet.`,
                        ephemeral: true,
                    });
                }
            }
        }
        // ΓöÇΓöÇ STORE / LOJA (customIds: store_browse, store_buy_*) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if ('customId' in interaction && typeof interaction.customId === 'string' && (interaction.customId === 'store_browse' ||
            interaction.customId.startsWith('store_buy_'))) {
            const { default: StoreModule } = await Promise.resolve().then(() => __importStar(require('../modules/automation/store')));
            await StoreModule?.handleInteraction?.(interaction);
            return;
        }
        // ΓöÇΓöÇ GIVEAWAY / SORTEIO (customIds: giveaway_join_*) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if ('customId' in interaction && typeof interaction.customId === 'string' && (interaction.customId.startsWith('giveaway_join_'))) {
            const { default: GiveawayModule } = await Promise.resolve().then(() => __importStar(require('../modules/automation/giveaway')));
            await GiveawayModule?.handleInteraction?.(interaction);
            return;
        }
        // ΓöÇΓöÇ APPLICATION / FORMUL├üRIO (customIds: application_*, app_*) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if ('customId' in interaction && typeof interaction.customId === 'string' && (interaction.customId === 'application_start' ||
            interaction.customId.startsWith('app_'))) {
            const { default: ApplicationModule } = await Promise.resolve().then(() => __importStar(require('../modules/automation/application')));
            await ApplicationModule?.handleInteraction?.(interaction);
            return;
        }
        // ΓöÇΓöÇ BOT├òES: Modulos ainda n├úo implementados ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        // Evita timeout silencioso (This interaction failed)
        if (interaction.isButton()) {
            if (interaction.customId === 'giveaway_join') {
                await interaction.reply({ content: '≡ƒÄë Use o comando `/giveaway start` para criar um sorteio real!', ephemeral: true });
                return;
            }
            if (interaction.customId === 'application_start') {
                await interaction.reply({ content: '≡ƒô¥ Os formul├írios est├úo sendo atualizados. Volte logo!', ephemeral: true });
                return;
            }
        }
        // ΓöÇΓöÇ SELECT MENU: Open Ticket Category ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        // CRITICO: mostrar modal IMEDIATAMENTE (sem API call ΓÇö Discord tem 3s de limite)
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select_category') {
            const categoryBase64 = interaction.values[0].replace('cat_', '');
            const modal = new discord_js_1.ModalBuilder()
                .setCustomId(`ticket_modal_${categoryBase64}`)
                .setTitle('Abrir Ticket');
            const subjectInput = new discord_js_1.TextInputBuilder()
                .setCustomId('ticket_subject')
                .setLabel('Assunto')
                .setStyle(discord_js_1.TextInputStyle.Short)
                .setPlaceholder('Descreva brevemente o motivo do ticket')
                .setRequired(true)
                .setMaxLength(100);
            const descInput = new discord_js_1.TextInputBuilder()
                .setCustomId('ticket_description')
                .setLabel('Descri├º├úo')
                .setStyle(discord_js_1.TextInputStyle.Paragraph)
                .setPlaceholder('Explique em detalhes o que voc├¬ precisa...')
                .setRequired(true)
                .setMaxLength(800);
            modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(subjectInput), new discord_js_1.ActionRowBuilder().addComponents(descInput));
            return interaction.showModal(modal);
        }
        // ΓöÇΓöÇ MODAL SUBMIT: Ticket criado ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal')) {
            await interaction.deferReply({ ephemeral: true });
            const subject = interaction.fields.getTextInputValue('ticket_subject');
            const description = interaction.fields.getTextInputValue('ticket_description');
            const guild = interaction.guild;
            const user = interaction.user;
            let lang = 'pt-BR';
            let config = {};
            try {
                const { data } = await api_client_1.default.get(`/internal/guilds/${guild.id}/modules`);
                lang = data.language || 'pt-BR';
                const ticketModule = data.modules?.find((m) => m.key === 'ticket');
                config = ticketModule?.config || {};
            }
            catch (e) { }
            const { tickets: ticketStrings } = (0, translations_1.getTranslation)(lang);
            try {
                logger_1.log.event(ticketStrings.creating.replace('{user}', user.tag).replace('{subject}', subject));
                // 1. Cria canal de ticket no Discord primeiro (para ter o ID)
                const parentOpt = config.categoryId ? { parent: config.categoryId } : {};
                const ticketChannel = await guild.channels.create({
                    name: ticketStrings.channelName.replace('{username}', user.username.slice(0, 10)),
                    type: discord_js_1.ChannelType.GuildText,
                    ...parentOpt,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [discord_js_1.PermissionFlagsBits.ViewChannel] },
                        { id: user.id, allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages] },
                        { id: guild.members.me.id, allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages] },
                        ...(config.staffRoleId ? [{ id: config.staffRoleId, allow: [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages] }] : []),
                    ]
                });
                let ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
                // 2. Registra ticket na Core API com o channelId
                try {
                    const response = await api_client_1.default.post('/internal/tickets', {
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
                }
                catch (e) {
                    logger_1.log.error('Erro ao registrar ticket na API: ' + e);
                }
                // 3. Welcome Message no canal do ticket
                const welcomeEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle(ticketStrings.welcomeTitle.replace('{ticketId}', ticketId))
                    .setDescription(ticketStrings.welcomeDesc
                    .replace('{user}', `<@${user.id}>`)
                    .replace('{subject}', subject)
                    .replace('{category}', Buffer.from(interaction.customId.split('_')[2], 'base64').toString()))
                    .setColor(0x5865F2)
                    .setFooter({ text: ticketStrings.footer.replace('{ticketId}', ticketId) });
                const closeBtn = new discord_js_1.ButtonBuilder()
                    .setCustomId(`close_ticket_${ticketId}`)
                    .setLabel(lang === 'pt-BR' ? 'Fechar Ticket' : 'Close Ticket')
                    .setStyle(discord_js_1.ButtonStyle.Danger)
                    .setEmoji('🔒');
                const row = new discord_js_1.ActionRowBuilder().addComponents(closeBtn);
                await ticketChannel.send({ content: `<@${user.id}> ${config.staffRoleId ? `<@&${config.staffRoleId}>` : ''}`, embeds: [welcomeEmbed], components: [row] });
                // DM confirmation to the ticket author.
                try {
                    const dmText = lang === 'pt-BR'
                        ? `Seu ticket foi aberto com sucesso em **${guild.name}**.\nCanal: #${ticketChannel.name}\nID: ${ticketId}`
                        : lang === 'es-ES'
                            ? `Tu ticket fue abierto correctamente en **${guild.name}**.\nCanal: #${ticketChannel.name}\nID: ${ticketId}`
                            : `Your ticket was opened successfully in **${guild.name}**.\nChannel: #${ticketChannel.name}\nID: ${ticketId}`;
                    await user.send({ content: dmText });
                }
                catch {
                    // Ignore when user has DMs disabled.
                }
                const jumpBtn = new discord_js_1.ButtonBuilder()
                    .setLabel(lang === 'pt-BR' ? '🎫 Ir para o Ticket' : lang === 'es-ES' ? '🎫 Ir al Ticket' : '🎫 Go to Ticket')
                    .setStyle(discord_js_1.ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${guild.id}/${ticketChannel.id}`);
                const jumpRow = new discord_js_1.ActionRowBuilder().addComponents(jumpBtn);
                return interaction.editReply({
                    content: ticketStrings.createdSuccess.replace('{channel}', `<#${ticketChannel.id}>`),
                    components: [jumpRow]
                });
            }
            catch (e) {
                logger_1.log.error('[TICKET] Erro ao finalizar abertura do ticket: ' + (e?.message || e));
                const failMsg = lang === 'pt-BR'
                    ? '❌ Não consegui finalizar a abertura do ticket. Tente novamente.'
                    : lang === 'es-ES'
                        ? '❌ No pude finalizar la apertura del ticket. Intenta nuevamente.'
                        : '❌ I could not finish opening the ticket. Please try again.';
                return interaction.editReply({ content: failMsg });
            }
        }
        // ΓöÇΓöÇ BOT├âO: Fechar Ticket ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if (interaction.isButton() && (interaction.customId.startsWith('close_ticket_') || interaction.customId.startsWith('finalize_ticket_'))) {
            const ticketId = interaction.customId.includes('close_ticket_')
                ? interaction.customId.replace('close_ticket_', '')
                : interaction.customId.replace('finalize_ticket_', '');
            await interaction.deferReply({ ephemeral: false });
            let lang = 'pt-BR';
            try {
                const { data } = await api_client_1.default.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
            }
            catch (e) { }
            try {
                await api_client_1.default.patch(`/internal/tickets/${ticketId}/close`);
            }
            catch (err) {
                logger_1.log.warn(`Erro ao fechar ticket na API: ${err.message}`);
            }
            const textChannel = interaction.channel;
            if (textChannel && 'send' in textChannel) {
                await textChannel.send({
                    embeds: [(0, embeds_1.ticketClosedEmbed)(lang === 'pt-BR' ? 'Equipe' : 'Staff', interaction.user.username)]
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
            }
            catch {
                // Ignore when user has DMs disabled.
            }
            const deleteMsg = lang === 'pt-BR' ? '≡ƒùæ∩╕Å Canal ser├í exclu├¡do em 5 segundos...' : lang === 'es-ES' ? '≡ƒùæ∩╕Å El canal ser├í eliminado en 5 segundos...' : '≡ƒùæ∩╕Å Channel will be deleted in 5 seconds...';
            setTimeout(() => interaction.channel?.delete().catch(() => null), 5000);
            return interaction.editReply({ content: deleteMsg });
        }
        if (interaction.isButton() && interaction.customId.startsWith('assume_ticket_')) {
            await interaction.deferReply({ ephemeral: true });
            let lang = 'pt-BR';
            try {
                const { data } = await api_client_1.default.get(`/internal/guilds/${interaction.guildId}/modules`);
                lang = data.language || 'pt-BR';
            }
            catch (e) { }
            const msg = lang === 'pt-BR' ? `Γ£à <@${interaction.user.id}> assumiu este ticket.` : `Γ£à <@${interaction.user.id}> assumed this ticket.`;
            return interaction.editReply({ content: msg });
        }
    }
};
