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
        .setName('kick')
        .setDescription('👢 Expulsa um membro do servidor')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.KickMembers)
        .addUserOption(o => o.setName('usuario').setDescription('Membro a ser expulso').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo da expulsão').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const target = interaction.options.getMember('usuario');
        const motivo = interaction.options.getString('motivo') || 'Sem motivo informado';
        if (!target)
            return interaction.editReply('❌ Usuário não encontrado.');
        if (target.user.bot)
            return interaction.editReply('❌ Não é possível expulsar um bot.');
        if (!target.kickable)
            return interaction.editReply('❌ Não tenho permissão para expulsar este usuário.');
        logger_1.log.event(`/kick: ${interaction.user.tag} → ${target.user.tag} | motivo: ${motivo}`);
        // DM antes de expulsar
        try {
            const dm = new discord_js_1.EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(`👢 Você foi expulso de ${interaction.guild?.name}`)
                .addFields({ name: '📋 Motivo', value: motivo })
                .setTimestamp();
            await target.send({ embeds: [dm] });
        }
        catch { /* DMs desativadas */ }
        await target.kick(motivo);
        try {
            await api_client_1.default.post('/internal/moderation/kick', {
                discordGuildId: interaction.guildId,
                staffId: interaction.user.id,
                staffName: interaction.user.username,
                userId: target.id,
                username: target.user.username,
                reason: motivo,
            });
        }
        catch (err) {
            logger_1.log.warn(`Core API não disponível para registrar kick: ${err.message}`);
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('👢 Membro Expulso')
            .addFields({ name: '👤 Usuário', value: `**${target.user.username}**`, inline: true }, { name: '🛡️ Staff', value: `<@${interaction.user.id}>`, inline: true }, { name: '📋 Motivo', value: motivo })
            .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
};
