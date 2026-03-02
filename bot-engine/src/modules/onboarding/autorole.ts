import { Client } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

const autorole: BaseModule = {
    id: 'autorole',
    name: 'Auto Role',
    category: 'Onboarding',

    init: (client: Client) => {
        client.on('guildMemberAdd', async (member) => {
            try {
                // 1. Fetch active modules for this guild
                const { data } = await coreApi.get(`/internal/guilds/${member.guild.id}/modules`);

                // 2. Check if this module is active
                const moduleInfo = data.modules.find((m: any) => m.key === 'autorole');
                if (!moduleInfo) return;

                const config = moduleInfo.config || {};
                const roleIds = config.roleIds;

                if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
                    return;
                }

                log.info(`[AUTOROLE] 🎭 Aplicando ${roleIds.length} cargos para ${member.user.tag} em ${member.guild.name}`);

                for (const roleId of roleIds) {
                    try {
                        const role = member.guild.roles.cache.get(roleId);
                        if (role) {
                            await member.roles.add(role);
                        } else {
                            log.warn(`[AUTOROLE] ⚠️ Cargo ${roleId} não encontrado no servidor.`);
                        }
                    } catch (err: any) {
                        log.error(`[AUTOROLE] ❌ Erro ao aplicar cargo ${roleId}: ${err.message}`);
                    }
                }

            } catch (error: any) {
                log.error(`[AUTOROLE] ❌ Erro ao processar autorole para ${member.user.tag}: ${error.message}`);
            }
        });
    }
};

export default autorole;
