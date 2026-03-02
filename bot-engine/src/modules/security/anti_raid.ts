import { Client, GuildMember } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

const joinLog = new Map<string, number[]>();

const anti_raid: BaseModule = {
    id: 'anti_raid',
    name: 'Anti Raid',
    category: 'Security',

    init: (client: Client) => {
        client.on('guildMemberAdd', async (member) => {
            try {
                const { data } = await coreApi.get(`/internal/guilds/${member.guild.id}/modules`);
                const moduleInfo = data.modules.find((m: any) => m.key === 'anti_raid');
                if (!moduleInfo) return;

                const config = moduleInfo.config || {};
                const threshold = config.threshold || 5; // members
                const windowMs = 5000; // 5 seconds

                const guildId = member.guild.id;
                const now = Date.now();

                if (!joinLog.has(guildId)) joinLog.set(guildId, []);
                const timestamps = joinLog.get(guildId)!;
                timestamps.push(now);

                // Clear old timestamps
                const recentTimestamps = timestamps.filter(t => now - t < windowMs);
                joinLog.set(guildId, recentTimestamps);

                if (recentTimestamps.length >= threshold) {
                    log.warn(`[ANTI-RAID] ⚠️ Raid detectada no servidor ${member.guild.name}. ${recentTimestamps.length} entradas recentes.`);

                    const action = config.action || 'LOCKDOWN';

                    if (action === 'KICK' || action === 'BAN') {
                        try {
                            if (action === 'KICK') await member.kick('Raid Protection');
                            if (action === 'BAN') await member.ban({ reason: 'Raid Protection' });
                            log.info(`[ANTI-RAID] 🔨 Usuário ${member.user.tag} foi ${action === 'KICK' ? 'expulso' : 'banido'} automaticamente.`);
                        } catch (err: any) {
                            log.error(`[ANTI-RAID] ❌ Erro ao executar ação punitiva: ${err.message}`);
                        }
                    } else {
                        // LOCKDOWN - just log for now
                        log.info(`[ANTI-RAID] 🔒 Modo LOCKDOWN ativado para o servidor ${member.guild.name}. (Lógica de canal não implementada no demo)`);
                    }
                }

            } catch (error: any) {
                log.error(`[ANTI-RAID] ❌ Erro ao processar raid protection: ${error.message}`);
            }
        });
    },

    handleAction: async (action: string, params: any) => {
        if (action === 'enable_lockdown') {
            log.info(`[ANTI-RAID] Entrando em modo lockdown via API: ${JSON.stringify(params)}`);
        }
    }
};

export default anti_raid;

