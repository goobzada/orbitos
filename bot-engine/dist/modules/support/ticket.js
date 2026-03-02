"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const ticket = {
    id: 'ticket',
    name: 'Sistema de Tickets',
    category: 'Support',
    init: (client) => {
        // Inicialização do módulo de tickets
    },
    handleInteraction: async (interaction) => {
        if (!interaction.isButton())
            return;
        if (interaction.customId === 'open_ticket') {
            // NOTE: Interaction handling for 'open_ticket' is also in interactionCreate.ts
            // We should ideally choose one. Let's keep the one in interactionCreate.ts for now
            // as it is more complete and has modal support.
            // This module-specific handler can be used for other things.
        }
    },
    handleAction: async (action, params) => {
        if (action === 'close_ticket_flow') {
            const { channelId, staffName } = params;
            logger_1.log.info(`[TICKET] 🔐 Finalização iniciada: ${channelId} por ${staffName}`);
            try {
                // Notificar no canal
                const channel = (await require('../../index').client).channels.cache.get(channelId);
                if (channel && channel.isTextBased()) {
                    await channel.send({
                        content: `**[Staff] ${staffName}** fechou este ticket pelo Dashboard. Este canal será excluído em 10 segundos.`
                    });
                }
                // Deletar após 10s (mais seguro)
                setTimeout(async () => {
                    try {
                        const targetChannel = (await require('../../index').client).channels.cache.get(channelId);
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
