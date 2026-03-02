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
        .setName('warn')
        .setDescription('⚠️ Adverte um membro com motivo registrado')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('usuario').setDescription('Membro a ser advertido').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo da advertência').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getMember('usuario');
        const motivo = interaction.options.getString('motivo', true);
        if (!target)
            return interaction.editReply('❌ Usuário não encontrado no servidor.');
        if (target.user.bot)
            return interaction.editReply('❌ Não é possível advertir um bot.');
        logger_1.log.event(`/warn: ${interaction.user.tag} → ${target.user.tag} | motivo: ${motivo}`);
        try {
            await api_client_1.default.post('/internal/moderation/warn', {
                discordGuildId: interaction.guildId,
                staffId: interaction.user.id,
                staffName: interaction.user.username,
                userId: target.id,
                username: target.user.username,
                reason: motivo,
            });
        }
        catch (err) {
            logger_1.log.warn(`Core API não disponível para registrar warn: ${err.message}`);
        }
        // Tenta enviar DM para o usuário
        try {
            const dm = new discord_js_1.EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle(`⚠️ Você recebeu uma advertência em ${interaction.guild?.name}`)
                .addFields({ name: '📋 Motivo', value: motivo })
                .setTimestamp();
            await target.send({ embeds: [dm] });
        }
        catch { /* DMs desativadas */ }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⚠️ Advertência Registrada')
            .addFields({ name: '👤 Usuário', value: `<@${target.id}>`, inline: true }, { name: '🛡️ Staff', value: `<@${interaction.user.id}>`, inline: true }, { name: '📋 Motivo', value: motivo })
            .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
};
