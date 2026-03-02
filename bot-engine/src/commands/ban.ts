import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    EmbedBuilder,
    GuildMember,
} from 'discord.js';
import { log } from '../utils/logger';
import coreApi from '../utils/api-client';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Bane um membro do servidor permanentemente')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(o => o.setName('usuario').setDescription('Membro a ser banido').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo do banimento').setRequired(true))
        .addIntegerOption(o => o.setName('deletar_mensagens').setDescription('Deletar mensagens dos últimos X dias (0-7)').setMinValue(0).setMaxValue(7)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getMember('usuario') as GuildMember;
        const motivo = interaction.options.getString('motivo', true);
        const deleteMessageDays = interaction.options.getInteger('deletar_mensagens') ?? 0;

        if (!target) return interaction.editReply('❌ Usuário não encontrado.');
        if (target.user.bot) return interaction.editReply('❌ Não é possível banir um bot.');
        if (!target.bannable) return interaction.editReply('❌ Não tenho permissão para banir este usuário.');

        log.event(`/ban: ${interaction.user.tag} → ${target.user.tag} | motivo: ${motivo}`);

        // DM antes do ban
        try {
            const dm = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(`🔨 Você foi banido de ${interaction.guild?.name}`)
                .addFields({ name: '📋 Motivo', value: motivo })
                .setTimestamp();
            await target.send({ embeds: [dm] });
        } catch { /* DMs desativadas */ }

        await target.ban({ reason: motivo, deleteMessageSeconds: deleteMessageDays * 86400 });

        try {
            await coreApi.post('/internal/moderation/ban', {
                discordGuildId: interaction.guildId,
                staffId: interaction.user.id,
                staffName: interaction.user.username,
                userId: target.id,
                username: target.user.username,
                reason: motivo,
            });
        } catch (err: any) {
            log.warn(`Core API não disponível para registrar ban: ${err.message}`);
        }

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔨 Membro Banido')
            .addFields(
                { name: '👤 Usuário', value: `**${target.user.username}**`, inline: true },
                { name: '🛡️ Staff', value: `<@${interaction.user.id}>`, inline: true },
                { name: '📋 Motivo', value: motivo },
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
