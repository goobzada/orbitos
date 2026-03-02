"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const api_client_1 = __importDefault(require("../utils/api-client"));
const translations_1 = require("../utils/translations");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('painel')
        .setDescription('⚙️ Painel de Controle — Envie módulos de automação para este canal')
        .setDescriptionLocalizations({
        'en-US': '⚙️ Control Panel — Send automation modules to this channel',
        'es-ES': '⚙️ Panel de Control — Enviar módulos de automatización a este canal'
    })
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        await interaction.deferReply({ ephemeral: true });
        try {
            const { data } = await api_client_1.default.get(`/internal/guilds/${interaction.guildId}/modules`);
            const activeModules = data.modules || [];
            const plan = data.plan || 'FREE';
            const communityType = data.communityType || 'general';
            const lang = data.language || 'pt-BR';
            const { ui, modules: moduleNames } = (0, translations_1.getTranslation)(lang);
            const planColor = plan === 'ENTERPRISE' ? 0xFFAA00 : plan === 'PRO' ? 0x9945FF : 0x5865F2;
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(ui.title)
                .setDescription(activeModules.length === 0
                ? ui.noModules
                : ui.selectDesc(interaction.channelId))
                .addFields({ name: ui.guild, value: interaction.guild?.name || 'Unknown', inline: true }, { name: ui.plan, value: `\`${plan}\``, inline: true }, { name: ui.type, value: `\`${communityType}\``, inline: true }, { name: ui.activeModules, value: `\`${activeModules.length}\``, inline: true })
                .setColor(planColor)
                .setFooter({ text: `OrbitOS Dashboard • ${lang}`, iconURL: interaction.client.user?.displayAvatarURL() });
            if (activeModules.length === 0) {
                const dashboardBtn = new discord_js_1.ButtonBuilder()
                    .setLabel(ui.openDashboard)
                    .setStyle(discord_js_1.ButtonStyle.Link)
                    .setURL('http://localhost:3001/dashboard/automations')
                    .setEmoji('🚀');
                const row = new discord_js_1.ActionRowBuilder().addComponents(dashboardBtn);
                return interaction.editReply({ embeds: [embed], components: [row] });
            }
            const select = new discord_js_1.StringSelectMenuBuilder()
                .setCustomId('painel_select_module')
                .setPlaceholder(ui.placeholder)
                .addOptions(activeModules.slice(0, 25).map((m) => {
                const translation = moduleNames[m.key];
                return {
                    label: translation?.name || m.name || m.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                    value: m.key,
                    description: translation?.description || m.description || `Send ${m.key} panel`,
                    emoji: translations_1.MODULE_EMOJIS[m.key] || translations_1.MODULE_EMOJIS.default,
                };
            }));
            const row = new discord_js_1.ActionRowBuilder().addComponents(select);
            return interaction.editReply({ embeds: [embed], components: [row] });
        }
        catch (error) {
            console.error('[PainelCmd] ❌ Erro:', error?.response?.data || error?.message);
            const status = error?.response?.status;
            let errorMsg = '❌ Error fetching server configuration.';
            if (!error.response) {
                errorMsg = '❌ **API offline** — OrbitOS server is not responding.';
            }
            else if (status === 404) {
                errorMsg = '❌ **Server not linked** — This Discord server is not associated with any organization.';
            }
            else if (status === 401 || status === 403) {
                errorMsg = '❌ **Internal authentication failed**.';
            }
            return interaction.editReply({ content: errorMsg });
        }
    }
};
