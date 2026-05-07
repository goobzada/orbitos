import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits
} from 'discord.js';
import coreApi from '../utils/api-client';
import { log } from '../utils/logger';

export default {
    data: new SlashCommandBuilder()
        .setName('referral')
        .setDescription('🤝 Sistema de Referências e Indicações')
        .addSubcommand(sub =>
            sub.setName('stats')
                .setDescription('Veja seus pontos de indicação')
        )
        .addSubcommand(sub =>
            sub.setName('ranking')
                .setDescription('Veja o ranking dos maiores indicadores do servidor')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const sub = interaction.options.getSubcommand();

        if (sub === 'stats') {
            await interaction.deferReply();

            try {
                const { data: stats } = await coreApi.get('/internal/referrals/stats', {
                    params: {
                        discordGuildId: interaction.guildId,
                        userId: interaction.user.id
                    }
                });

                const embed = new EmbedBuilder()
                    .setTitle('🤝 Suas Indicações')
                    .setDescription(
                        `Olá **${interaction.user.username}**! Aqui estão suas estatísticas:\n\n` +
                        `👤 **Pontos de Indicação:** \`${stats.points || 0}\`\n\n` +
                        `🔗 **Como convidar?**\n` +
                        `Basta criar um link de convite deste servidor e enviar para seus amigos. Quando eles entrarem, você ganha pontos automaticamente!`
                    )
                    .setColor(0x57F287)
                    .setThumbnail(interaction.user.avatarURL())
                    .setFooter({ text: 'OrbitOS Referral System' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            } catch (error: any) {
                log.error(`[ReferralCmd] Erro stats: ${error.message}`);
                return interaction.editReply({ content: '❌ Erro ao buscar suas estatísticas.' });
            }
        }

        if (sub === 'ranking') {
            await interaction.deferReply();

            try {
                const { data: ranking } = await coreApi.get('/internal/referrals/ranking', {
                    params: { discordGuildId: interaction.guildId }
                });

                if (!ranking.length) {
                    return interaction.editReply({ content: 'ℹ️ Ainda não há ninguém no ranking de indicações.' });
                }

                const embed = new EmbedBuilder()
                    .setTitle('🏆 Top Indicadores')
                    .setDescription(
                        ranking.map((row: any, i: number) => {
                            const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
                            return `${emoji} **${i + 1}º** — <@${row.userId}> : \`${row.points}\` pontos`;
                        }).join('\n')
                    )
                    .setColor(0xFEE75C)
                    .setFooter({ text: 'OrbitOS Referral System' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            } catch (error: any) {
                log.error(`[ReferralCmd] Erro ranking: ${error.message}`);
                return interaction.editReply({ content: '❌ Erro ao buscar o ranking.' });
            }
        }
    }
};
