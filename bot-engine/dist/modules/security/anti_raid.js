"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const api_client_1 = __importDefault(require("../../utils/api-client"));
const joinLog = new Map();
const anti_raid = {
    id: 'anti_raid',
    name: 'Anti Raid',
    category: 'Security',
    init: (client) => {
        client.on('guildMemberAdd', async (member) => {
            try {
                const { data } = await api_client_1.default.get(`/internal/guilds/${member.guild.id}/modules`);
                const moduleInfo = data.modules.find((m) => m.key === 'anti_raid');
                if (!moduleInfo)
                    return;
                const config = moduleInfo.config || {};
                const threshold = config.threshold || 5; // members
                const windowMs = 5000; // 5 seconds
                const guildId = member.guild.id;
                const now = Date.now();
                if (!joinLog.has(guildId))
                    joinLog.set(guildId, []);
                const timestamps = joinLog.get(guildId);
                timestamps.push(now);
                // Clear old timestamps
                const recentTimestamps = timestamps.filter(t => now - t < windowMs);
                joinLog.set(guildId, recentTimestamps);
                if (recentTimestamps.length >= threshold) {
                    logger_1.log.warn(`[ANTI-RAID] ⚠️ Raid detectada no servidor ${member.guild.name}. ${recentTimestamps.length} entradas recentes.`);
                    const action = config.action || 'LOCKDOWN';
                    if (action === 'KICK' || action === 'BAN') {
                        try {
                            if (action === 'KICK')
                                await member.kick('Raid Protection');
                            if (action === 'BAN')
                                await member.ban({ reason: 'Raid Protection' });
                            logger_1.log.info(`[ANTI-RAID] 🔨 Usuário ${member.user.tag} foi ${action === 'KICK' ? 'expulso' : 'banido'} automaticamente.`);
                        }
                        catch (err) {
                            logger_1.log.error(`[ANTI-RAID] ❌ Erro ao executar ação punitiva: ${err.message}`);
                        }
                    }
                    else {
                        // LOCKDOWN - just log for now
                        logger_1.log.info(`[ANTI-RAID] 🔒 Modo LOCKDOWN ativado para o servidor ${member.guild.name}. (Lógica de canal não implementada no demo)`);
                    }
                }
            }
            catch (error) {
                logger_1.log.error(`[ANTI-RAID] ❌ Erro ao processar raid protection: ${error.message}`);
            }
        });
    },
    handleAction: async (action, params) => {
        if (action === 'enable_lockdown') {
            logger_1.log.info(`[ANTI-RAID] Entrando em modo lockdown via API: ${JSON.stringify(params)}`);
        }
    }
};
exports.default = anti_raid;
