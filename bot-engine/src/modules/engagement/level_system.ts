import { Client, TextChannel } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

// Simple in-memory storage for demonstration. 
// In a real scenario, this would go to a database via the Core API.
const xpStorage = new Map<string, number>();

const level_system: BaseModule = {
    id: 'level_system',
    name: 'Sistema de Níveis',
    category: 'Engagement',

    init: (client: Client) => {
        client.on('messageCreate', async (message) => {
            if (message.author.bot || !message.guild) return;

            try {
                // 1. Fetch active modules for this guild
                const { data } = await coreApi.get(`/internal/guilds/${message.guild.id}/modules`);

                // 2. Check if this module is active
                const moduleInfo = data.modules.find((m: any) => m.key === 'level_system');
                if (!moduleInfo) return;

                const config = moduleInfo.config || {};
                const multiplier = config.xpMultiplier || 1.0;
                const xpGain = Math.floor((Math.random() * 5 + 5) * multiplier);

                const key = `${message.guild.id}:${message.author.id}`;
                const currentXp = xpStorage.get(key) || 0;
                const nextXp = currentXp + xpGain;
                xpStorage.set(key, nextXp);

                // Simple level-up calculation: every 100 XP is a level
                const oldLevel = Math.floor(currentXp / 100);
                const newLevel = Math.floor(nextXp / 100);

                if (newLevel > oldLevel) {
                    const channelId = config.rankChannelId;
                    const channel = (channelId ? message.guild.channels.cache.get(channelId) : message.channel) as TextChannel;

                    if (channel) {
                        try {
                            await channel.send(`🏆 Parabéns ${message.author.toString()}! Você subiu para o nível **${newLevel}**!`);
                        } catch (err: any) {
                            log.error(`[LEVELS] ❌ Erro ao enviar mensagem de levelup: ${err.message}`);
                        }
                    }
                }

            } catch (error: any) {
                log.error(`[LEVELS] ❌ Erro ao processar mensagem do autor ${message.author.id}: ${error.message}`);
            }
        });
    },

    handleAction: async (action: string, params: any) => {
        if (action === 'add_xp') {
            log.info(`[LEVELS] XP adicionado via API do Dashboard: ${JSON.stringify(params)}`);
        }
    }
};

export default level_system;

