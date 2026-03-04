import {
    Client,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    TextChannel,
} from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

/**
 * GiveawayModule
 * Gerencia sorteios profissionais com persistência na Core API.
 */

async function joinGiveaway(interaction: ButtonInteraction) {
    const giveawayId = interaction.customId.replace('giveaway_join_', '');

    await interaction.deferReply({ ephemeral: true });

    try {
        const { data } = await coreApi.post('/internal/giveaways/join', {
            giveawayId,
            userId: interaction.user.id,
            username: interaction.user.tag
        });

        await interaction.editReply({
            content: `✅ **Sucesso!** Você agora está participando deste sorteio.\n📊 Total de participantes: **${data.participantCount}**`
        });
    } catch (error: any) {
        const msg = error.response?.data?.error || 'Erro ao entrar no sorteio.';
        await interaction.editReply({ content: `❌ ${msg}` });
    }
}

async function checkGiveawayTimers(client: Client) {
    try {
        const { data: activeGiveaways } = await coreApi.get('/internal/giveaways/active');

        for (const giveaway of activeGiveaways) {
            const now = new Date();
            const endsAt = new Date(giveaway.endsAt);

            if (now >= endsAt) {
                log.info(`[Giveaway] Finalizando sorteio: ${giveaway.title}`);
                const { data: result } = await coreApi.patch(`/internal/giveaways/${giveaway.id}/end`);

                const channel = await client.channels.fetch(giveaway.channelId) as TextChannel;
                if (!channel) continue;

                const winners = result.winners || [];
                const winnersList = winners.length > 0
                    ? winners.map((id: string) => `<@${id}>`).join(', ')
                    : 'Nenhum participante.';

                const embed = new EmbedBuilder()
                    .setTitle(`🎉  Sorteio Encerrado: ${giveaway.prize}`)
                    .setDescription(
                        `O sorteio chegou ao fim!\n\n` +
                        `🏆 **Vencedor(es):** ${winnersList}\n` +
                        `📊 Total de inscritos: **${result.participants?.length || 0}**`
                    )
                    .setColor(0xFEE75C) // Yellow
                    .setFooter({ text: 'OrbitOS Giveaway Engine' })
                    .setTimestamp();

                await channel.send({ content: `🎊 Parabéns aos vencedores! ${winnersList}`, embeds: [embed] });

                // Opcional: tentar editar a mensagem original do sorteio se tiver o messageId
                if (giveaway.messageId) {
                    try {
                        const message = await channel.messages.fetch(giveaway.messageId);
                        if (message) {
                            const originalEmbed = EmbedBuilder.from(message.embeds[0]);
                            originalEmbed.setColor(0x36393F).setTitle(`[ENCERRADO] ${giveaway.prize}`);
                            await message.edit({ embeds: [originalEmbed], components: [] });
                        }
                    } catch (e) { }
                }
            }
        }
    } catch (error: any) {
        log.error(`[Giveaway Timer] Erro: ${error.message}`);
    }
}

const GiveawayModule: BaseModule = {
    id: 'giveaway',
    name: 'Sorteios Professionais',
    category: 'Engagement',

    async init(client: Client) {
        log.info('[GiveawayModule] Módulo carregado. Iniciando timer de monitoramento...');
        // Verifica a cada 30 segundos
        setInterval(() => checkGiveawayTimers(client), 30000);
    },

    async handleInteraction(interaction: Interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith('giveaway_join_')) {
            await joinGiveaway(interaction as ButtonInteraction);
            return;
        }
    }
};

export default GiveawayModule;
