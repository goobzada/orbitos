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
        .setName('warn')
        .setDescription('⚠️ Adverte um membro com motivo registrado')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('usuario').setDescription('Membro a ser advertido').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Motivo da advertência').setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getMember('usuario') as GuildMember;
        const motivo = interaction.options.getString('motivo', true);

        if (!target) return interaction.editReply('❌ Usuário não encontrado no servidor.');
        if (target.user.bot) return interaction.editReply('❌ Não é possível advertir um bot.');

        log.event(`/warn: ${interaction.user.tag} → ${target.user.tag} | motivo: ${motivo}`);

        try {
            await coreApi.post('/internal/moderation/warn', {
                discordGuildId: interaction.guildId,
                staffId: interaction.user.id,
                staffName: interaction.user.username,
                userId: target.id,
                username: target.user.username,
                reason: motivo,
            });
        } catch (err: any) {
            log.warn(`Core API não disponível para registrar warn: ${err.message}`);
        }

        // Tenta enviar DM para o usuário
        try {
            const dm = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle(`⚠️ Você recebeu uma advertência em ${interaction.guild?.name}`)
                .addFields({ name: '📋 Motivo', value: motivo })
                .setTimestamp();
            await target.send({ embeds: [dm] });
        } catch { /* DMs desativadas */ }

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⚠️ Advertência Registrada')
            .addFields(
                { name: '👤 Usuário', value: `<@${target.id}>`, inline: true },
                { name: '🛡️ Staff', value: `<@${interaction.user.id}>`, inline: true },
                { name: '📋 Motivo', value: motivo },
            )
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
