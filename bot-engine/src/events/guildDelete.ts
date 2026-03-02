import { Events, Guild } from 'discord.js';
import { log } from '../utils/logger';
import coreApi from '../utils/api-client';

export default {
    name: Events.GuildDelete,
    once: false,
    async execute(guild: Guild) {
        log.event(`Bot removido do servidor: ${guild.name} (${guild.id})`);

        try {
            await coreApi.patch(`/internal/guilds/${guild.id}/disconnect`);
            log.api(`Servidor ${guild.name} marcado como desconectado na Core API.`);
        } catch (err: any) {
            log.warn(`Não foi possível notificar remoção do servidor ${guild.name}: ${err.message}`);
        }
    }
};
