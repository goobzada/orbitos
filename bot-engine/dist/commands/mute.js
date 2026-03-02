"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../utils/logger");
const api_client_1 = __importDefault(require("../utils/api-client"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Silencia um membro por tempo determinado (timeout)')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('usuario').setDescription('Membro a ser silenciado').setRequired(true))
        .addIntegerOption(o => o.setName('duracao').setDescription('Duração em minutos').setRequired(true).setMinValue(1).setMaxValue(40320))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo do silenciamento').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getMember('usuario');
        const duracao = interaction.options.getInteger('duracao', true);
        const motivo = interaction.options.getString('motivo', true);
        if (!target)
            return interaction.editReply('❌ Usuário não encontrado.');
        if (target.user.bot)
            return interaction.editReply('❌ Não é possível silenciar um bot.');
        if (!target.moderatable)
            return interaction.editReply('❌ Não tenho permissão para silenciar este usuário.');
        logger_1.log.event(`/mute: ${interaction.user.tag} → ${target.user.tag} por ${duracao}min | motivo: ${motivo}`);
        const durationMs = duracao * 60 * 1000;
        await target.timeout(durationMs, motivo);
        try {
            await api_client_1.default.post('/internal/moderation/mute', {
                discordGuildId: interaction.guildId,
                staffId: interaction.user.id,
                staffName: interaction.user.username,
                userId: target.id,
                username: target.user.username,
                reason: motivo,
                duration: duracao,
            });
        }
        catch (err) {
            logger_1.log.warn(`Core API não disponível para registrar mute: ${err.message}`);
        }
        // DM para o usuário
        try {
            const dm = new discord_js_1.EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(`🔇 Você foi silenciado em ${interaction.guild?.name}`)
                .addFields({ name: '⏱️ Duração', value: `${duracao} minuto(s)`, inline: true }, { name: '📋 Motivo', value: motivo })
                .setTimestamp();
            await target.send({ embeds: [dm] });
        }
        catch { /* DMs desativadas */ }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔇 Membro Silenciado')
            .addFields({ name: '👤 Usuário', value: `<@${target.id}>`, inline: true }, { name: '⏱️ Duração', value: `${duracao} min`, inline: true }, { name: '🛡️ Staff', value: `<@${interaction.user.id}>`, inline: true }, { name: '📋 Motivo', value: motivo })
            .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
};
