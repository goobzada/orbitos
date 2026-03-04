import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from 'discord.js';
import coreApi from '../utils/api-client';
import { log } from '../utils/logger';

export default {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('🎉 Gerencia sorteios no servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Inicia um novo sorteio')
                .addStringOption(opt => opt.setName('prize').setDescription('O que será sorteado?').setRequired(true))
                .addIntegerOption(opt => opt.setName('duration').setDescription('Duração em minutos').setRequired(true))
                .addIntegerOption(opt => opt.setName('winners').setDescription('Quantidade de vencedores').setRequired(false))
                .addStringOption(opt => opt.setName('title').setDescription('Título personalizado').setRequired(false))
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const sub = interaction.options.getSubcommand();

        if (sub === 'start') {
            await interaction.deferReply({ ephemeral: true });

            const prize = interaction.options.getString('prize', true);
            const duration = interaction.options.getInteger('duration', true);
            const winners = interaction.options.getInteger('winners') || 1;
            const title = interaction.options.getString('title') || '🎉 Novo Sorteio!';

            try {
                // 1. Registra na API
                const { data: giveaway } = await coreApi.post('/internal/giveaways', {
                    discordGuildId: interaction.guildId,
                    title,
                    prize,
                    winnersCount: winners,
                    durationMinutes: duration,
                    authorId: interaction.user.id,
                    channelId: interaction.channelId
                });

                const endsAt = new Date(giveaway.endsAt);
                const timestamp = Math.floor(endsAt.getTime() / 1000);

                // 2. Cria o Embed do Sorteio
                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(
                        `Um novo sorteio começou! Clique no botão abaixo para participar.\n\n` +
                        `🎁 **Prêmio:** ${prize}\n` +
                        `🏆 **Vencedores:** ${winners}\n` +
                        `⏰ **Encerra em:** <t:${timestamp}:R> (<t:${timestamp}:f>)`
                    )
                    .setColor(0x5865F2)
                    .setFooter({ text: 'OrbitOS Giveaway System • Boa sorte!' })
                    .setTimestamp();

                const joinBtn = new ButtonBuilder()
                    .setCustomId(`giveaway_join_${giveaway.id}`)
                    .setLabel('Participar')
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinBtn);

                // 3. Envia no canal
                const message = await interaction.channel?.send({
                    embeds: [embed],
                    components: [row]
                });

                return interaction.editReply({ content: '✅ Sorteio iniciado com sucesso!' });

            } catch (error: any) {
                log.error(`[GiveawayCmd] Erro ao iniciar: ${error.message}`);
                return interaction.editReply({ content: '❌ Erro ao processar o sorteio na API. Verifique se o módulo está ativo.' });
            }
        }
    }
};
