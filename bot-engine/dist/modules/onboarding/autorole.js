"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const api_client_1 = __importDefault(require("../../utils/api-client"));
const autorole = {
    id: 'autorole',
    name: 'Auto Role',
    category: 'Onboarding',
    init: (client) => {
        client.on('guildMemberAdd', async (member) => {
            try {
                // 1. Fetch active modules for this guild
                const { data } = await api_client_1.default.get(`/internal/guilds/${member.guild.id}/modules`);
                // 2. Check if this module is active
                const moduleInfo = data.modules.find((m) => m.key === 'autorole');
                if (!moduleInfo)
                    return;
                const config = moduleInfo.config || {};
                const roleIds = config.roleIds;
                if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
                    return;
                }
                logger_1.log.info(`[AUTOROLE] 🎭 Aplicando ${roleIds.length} cargos para ${member.user.tag} em ${member.guild.name}`);
                for (const roleId of roleIds) {
                    try {
                        const role = member.guild.roles.cache.get(roleId);
                        if (role) {
                            await member.roles.add(role);
                        }
                        else {
                            logger_1.log.warn(`[AUTOROLE] ⚠️ Cargo ${roleId} não encontrado no servidor.`);
                        }
                    }
                    catch (err) {
                        logger_1.log.error(`[AUTOROLE] ❌ Erro ao aplicar cargo ${roleId}: ${err.message}`);
                    }
                }
            }
            catch (error) {
                logger_1.log.error(`[AUTOROLE] ❌ Erro ao processar autorole para ${member.user.tag}: ${error.message}`);
            }
        });
    }
};
exports.default = autorole;
