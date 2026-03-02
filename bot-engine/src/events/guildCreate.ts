import { Events, Guild, TextChannel, PermissionFlagsBits } from 'discord.js';
import { log } from '../utils/logger';
import coreApi from '../utils/api-client';
import { guildWelcomeEmbed } from '../utils/embeds';

export default {
    name: Events.GuildCreate,
    once: false,
    async execute(guild: Guild) {
        log.event(`Adicionado ao servidor: ${guild.name} (ID: ${guild.id}) — ${guild.memberCount} membros`);

        // 1. Tenta registrar na Core API 
        try {
            await coreApi.post('/internal/guilds', {
                discordGuildId: guild.id,
                name: guild.name,
                icon: guild.iconURL({ size: 256 }),
                memberCount: guild.memberCount,
            });
            log.api(`Servidor ${guild.name} sincronizado com a Core API.`);
        } catch (err: any) {
            log.warn(`Não foi possível sincronizar ${guild.name} com a API: ${err?.response?.data?.error || err.message}`);
        }

        // 2. Manda embed de boas-vindas para o canal "geral" do servidor
        const systemChannel = guild.systemChannel;
        if (systemChannel?.permissionsFor(guild.members.me!)?.has(PermissionFlagsBits.SendMessages)) {
            await systemChannel.send({ embeds: [guildWelcomeEmbed(guild.name)] });
        }
    }
};
