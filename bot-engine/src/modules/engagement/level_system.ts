import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

// Cooldown em memória: key = guildId:userId, value = timestamp da última mensagem com XP
const cooldowns = new Map<string, number>();

// XP por mensagem (aleatório entre min e max)
const XP_MIN = 15;
const XP_MAX = 25;
const COOLDOWN_MS = 60_000; // 1 minuto

const level_system: BaseModule = {
    id: 'level_system',
    name: 'Sistema de Níveis',
    category: 'Engagement',

    init: (client: Client) => {
        client.on('messageCreate', async (message) => {
            if (message.author.bot || !message.guild) return;

            try {
                // 1. Buscar config do módulo
                const { data } = await coreApi.get(`/internal/guilds/${message.guild.id}/modules`);
                const moduleInfo = data.modules.find((m: any) => m.key === 'level_system');
                if (!moduleInfo) return;

                const config = moduleInfo.config || {};
                const multiplier = parseFloat(config.xpMultiplier) || 1.0;
                const rankChannelId: string | null = config.rankChannelId || null;
                const levelUpMessage: string | null = config.levelUpMessage || null;

                // 2. Cooldown por usuário por servidor
                const coolKey = `${message.guild.id}:${message.author.id}`;
                const now = Date.now();
                const lastXp = cooldowns.get(coolKey) || 0;
                if (now - lastXp < COOLDOWN_MS) return;
                cooldowns.set(coolKey, now);

                // 3. Calcular XP a ganhar
                const baseXp = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
                const xpGain = Math.round(baseXp * multiplier);

                // 4. Enviar para a API e verificar level-up
                const { data: result } = await coreApi.post('/internal/levels/xp', {
                    guildId: message.guild.id,
                    userId: message.author.id,
                    username: message.author.username,
                    avatarUrl: message.author.displayAvatarURL({ size: 128 }),
                    xpGain,
                });

                if (!result.leveledUp) return;

                // 5. Montar embed de level-up
                const guild = message.guild;
                const user = message.author;
                const newLevel: number = result.level;
                const xpToNext: number = result.xpToNext;
                const rank: number = result.rank;

                const defaultMsg = levelUpMessage
                    ? levelUpMessage
                        .replace('{user}', `<@${user.id}>`)
                        .replace('{level}', String(newLevel))
                    : `<@${user.id}> subiu para o nível **${newLevel}**! 🎉`;

                const embed = new EmbedBuilder()
                    .setColor(0x6366F1) // Indigo Premium
                    .setAuthor({ 
                        name: `Evolução de Nível • ${user.username}`, 
                        iconURL: user.displayAvatarURL({ size: 64 }) 
                    })
                    .setDescription(
                        `### ✨ Novo Nível Alcançado!\n` +
                        `Parabéns <@${user.id}>, seu engajamento te levou a um novo patamar na nossa comunidade!\n\n` +
                        `**ESTATÍSTICAS ATUAIS**\n` +
                        `╰── Nível Atual: **\` ${newLevel} \`**\n` +
                        `╰── Posição Global: **\` #${rank} \`**\n\n` +
                        `**PRÓXIMO OBJETIVO**\n` +
                        `╰── Faltam **\` ${xpToNext} \`** XP para o próximo nível.`
                    )
                    .setThumbnail(user.displayAvatarURL({ size: 256 }))
                    .setFooter({ 
                        text: `OrbitUp • Sistema de Engajamento`, 
                        iconURL: guild.iconURL() || undefined 
                    });

                // 6. Enviar no canal configurado ou no canal atual
                let targetChannel: TextChannel | null = null;
                if (rankChannelId) {
                    targetChannel = (guild.channels.cache.get(rankChannelId)
                        || await guild.channels.fetch(rankChannelId).catch(() => null)) as TextChannel | null;
                }
                if (!targetChannel) {
                    targetChannel = message.channel as TextChannel;
                }

                if (targetChannel && 'send' in targetChannel) {
                    await targetChannel.send({ embeds: [embed] });
                    log.event(`[LEVELS] 🎉 ${user.username} subiu para nível ${newLevel} em ${guild.name}`);
                }

            } catch (error: any) {
                // Silencia erros de rede/rate-limit para não poluir o log
                if (!error.message?.includes('404')) {
                    log.error(`[LEVELS] ❌ Erro: ${error.message}`);
                }
            }
        });
    },

    handleAction: async (action: string, params: any) => {
        if (action === 'get_rank') {
            try {
                const { data } = await coreApi.get(`/internal/levels/${params.guildId}/${params.userId}`);
                return data;
            } catch {
                return null;
            }
        }
    }
};

export default level_system;

