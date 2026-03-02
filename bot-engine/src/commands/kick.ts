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
        .setName('kick')
        .setDescription('👢 Expulsa um membro do servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(o => o.setName('usuario').setDescription('Membro a ser expulso').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo da expulsão').setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getMember('usuario') as GuildMember;
        const motivo = interaction.options.getString('motivo') || 'Sem motivo informado';

        if (!target) return interaction.editReply('❌ Usuário não encontrado.');
        if (target.user.bot) return interaction.editReply('❌ Não é possível expulsar um bot.');
        if (!target.kickable) return interaction.editReply('❌ Não tenho permissão para expulsar este usuário.');

        log.event(`/kick: ${interaction.user.tag} → ${target.user.tag} | motivo: ${motivo}`);

        // DM antes de expulsar
        try {
            const dm = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle(`👢 Você foi expulso de ${interaction.guild?.name}`)
                .addFields({ name: '📋 Motivo', value: motivo })
                .setTimestamp();
            await target.send({ embeds: [dm] });
        } catch { /* DMs desativadas */ }

        await target.kick(motivo);

        try {
            await coreApi.post('/internal/moderation/kick', {
                discordGuildId: interaction.guildId,
                staffId: interaction.user.id,
                staffName: interaction.user.username,
                userId: target.id,
                username: target.user.username,
                reason: motivo,
            });
        } catch (err: any) {
            log.warn(`Core API não disponível para registrar kick: ${err.message}`);
        }

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('👢 Membro Expulso')
            .addFields(
                { name: '👤 Usuário', value: `**${target.user.username}**`, inline: true },
                { name: '🛡️ Staff', value: `<@${interaction.user.id}>`, inline: true },
                { name: '📋 Motivo', value: motivo },
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
