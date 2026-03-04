import { Client, Interaction, EmbedBuilder } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

let discordClient: Client;

const ticket: BaseModule = {
    id: 'ticket',
    name: 'Sistema de Tickets',
    category: 'Support',

    init: (client: Client) => {
        discordClient = client;
    },

    handleInteraction: async (interaction: Interaction) => {
        if (!interaction.isButton()) return;
        // ... interações
    },

    handleAction: async (action: string, params: any) => {
        if (action === 'close_ticket_flow') {
            const { channelId, staffName } = params;
            log.info(`[TICKET] 🔐 Finalização iniciada: ${channelId} por ${staffName}`);

            try {
                if (!discordClient) {
                    log.error('[TICKET] ❌ Client não inicializado no módulo.');
                    return;
                }

                const channel = await discordClient.channels.fetch(channelId).catch(() => null);

                if (channel && channel.isTextBased()) {
                    await (channel as any).send({
                        content: `**[Staff] ${staffName}** fechou este ticket pelo Dashboard. Este canal será excluído em 10 segundos.`
                    }).catch(() => { });
                }

                // Deletar após 10s (mais seguro)
                setTimeout(async () => {
                    try {
                        const targetChannel = await discordClient.channels.fetch(channelId).catch(() => null);
                        if (targetChannel) await (targetChannel as any).delete();
                        log.info(`[TICKET] 🗑️ Canal deletado: ${channelId}`);
                    } catch (e) {
                        log.error(`[TICKET] ❌ Erro ao deletar canal: ${e}`);
                    }
                }, 10000);

            } catch (err) {
                log.error(`[TICKET] ❌ Erro no fluxo de fechamento: ${err}`);
            }
        }
    }
};

export default ticket;
