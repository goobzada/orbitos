"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
let discordClient;
const ticket = {
    id: 'ticket',
    name: 'Sistema de Tickets',
    category: 'Support',
    init: (client) => {
        discordClient = client;
    },
    handleInteraction: async (interaction) => {
        if (!interaction.isButton())
            return;
        // ... interações
    },
    handleAction: async (action, params) => {
        if (action === 'close_ticket_flow') {
            const { channelId, staffName } = params;
            logger_1.log.info(`[TICKET] 🔐 Finalização iniciada: ${channelId} por ${staffName}`);
            try {
                if (!discordClient) {
                    logger_1.log.error('[TICKET] ❌ Client não inicializado no módulo.');
                    return;
                }
                const channel = await discordClient.channels.fetch(channelId).catch(() => null);
                if (channel && channel.isTextBased()) {
                    await channel.send({
                        content: `**[Staff] ${staffName}** fechou este ticket pelo Dashboard. Este canal será excluído em 10 segundos.`
                    }).catch(() => { });
                }
                // Deletar após 10s (mais seguro)
                setTimeout(async () => {
                    try {
                        const targetChannel = await discordClient.channels.fetch(channelId).catch(() => null);
                        if (targetChannel)
                            await targetChannel.delete();
                        logger_1.log.info(`[TICKET] 🗑️ Canal deletado: ${channelId}`);
                    }
                    catch (e) {
                        logger_1.log.error(`[TICKET] ❌ Erro ao deletar canal: ${e}`);
                    }
                }, 10000);
            }
            catch (err) {
                logger_1.log.error(`[TICKET] ❌ Erro no fluxo de fechamento: ${err}`);
            }
        }
    }
};
exports.default = ticket;
