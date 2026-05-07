import { Events, Client } from 'discord.js';
import { log } from '../utils/logger';
import { InviteTracker } from '../utils/InviteTracker';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        log.success(`🤖 Bot online como ${client.user?.tag}!`);
        log.info(`Servindo ${client.guilds.cache.size} servidor(es)`);

        client.user?.setPresence({
            status: 'online',
            activities: [{
                name: 'OrbitOS Dashboard',
                type: 0
            }]
        });

        // Auto-registro das guilds na API Core ao ligar
        const coreApi = (await import('../utils/api-client')).default;
        for (const [id, guild] of client.guilds.cache) {
            try {
                await coreApi.post('/internal/guilds', {
                    discordGuildId: id,
                    name: guild.name,
                    icon: guild.iconURL({ size: 128 }),
                    memberCount: guild.memberCount
                });

                await InviteTracker.init(guild);
                log.info(`[AUTO-SYNC] Guild ${guild.name} sincronizada.`);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    log.warn(`[AUTO-SYNC] Guild ${guild.name} (${id}) não vinculada no Dashboard.`);
                } else {
                    log.error(`[AUTO-SYNC] Erro ao sincronizar ${guild.name}: ${err.message}`);
                }
            }
        }
    }
};
