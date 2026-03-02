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
        .setName('mute')
        .setDescription('🔇 Silencia um membro por tempo determinado (timeout)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('usuario').setDescription('Membro a ser silenciado').setRequired(true))
        .addIntegerOption(o => o.setName('duracao').setDescription('Duração em minutos').setRequired(true).setMinValue(1).setMaxValue(40320))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo do silenciamento').setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getMember('usuario') as GuildMember;
        const duracao = interaction.options.getInteger('duracao', true);
        const motivo = interaction.options.getString('motivo', true);

        if (!target) return interaction.editReply('❌ Usuário não encontrado.');
        if (target.user.bot) return interaction.editReply('❌ Não é possível silenciar um bot.');
        if (!target.moderatable) return interaction.editReply('❌ Não tenho permissão para silenciar este usuário.');

        log.event(`/mute: ${interaction.user.tag} → ${target.user.tag} por ${duracao}min | motivo: ${motivo}`);

        const durationMs = duracao * 60 * 1000;
        await target.timeout(durationMs, motivo);

        try {
            await coreApi.post('/internal/moderation/mute', {
                discordGuildId: interaction.guildId,
                staffId: interaction.user.id,
                staffName: interaction.user.username,
                userId: target.id,
                username: target.user.username,
                reason: motivo,
                duration: duracao,
            });
        } catch (err: any) {
            log.warn(`Core API não disponível para registrar mute: ${err.message}`);
        }

        // DM para o usuário
        try {
            const dm = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(`🔇 Você foi silenciado em ${interaction.guild?.name}`)
                .addFields(
                    { name: '⏱️ Duração', value: `${duracao} minuto(s)`, inline: true },
                    { name: '📋 Motivo', value: motivo },
                )
                .setTimestamp();
            await target.send({ embeds: [dm] });
        } catch { /* DMs desativadas */ }

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔇 Membro Silenciado')
            .addFields(
                { name: '👤 Usuário', value: `<@${target.id}>`, inline: true },
                { name: '⏱️ Duração', value: `${duracao} min`, inline: true },
                { name: '🛡️ Staff', value: `<@${interaction.user.id}>`, inline: true },
                { name: '📋 Motivo', value: motivo },
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
