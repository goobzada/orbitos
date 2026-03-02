"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../utils/logger");
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async execute(client) {
        logger_1.log.success(`🤖 Bot online como ${client.user?.tag}!`);
        logger_1.log.info(`Servindo ${client.guilds.cache.size} servidor(es)`);
        client.user?.setPresence({
            status: 'online',
            activities: [{
                    name: 'SaaSBot Dashboard',
                    type: 0 // Tipo "Jogando"
                }]
        });
        // Auto-registro das guilds na API Core ao ligar
        const coreApi = (await Promise.resolve().then(() => __importStar(require('../utils/api-client')))).default;
        for (const [id, guild] of client.guilds.cache) {
            try {
                await coreApi.post('/internal/guilds', {
                    discordGuildId: id,
                    name: guild.name,
                    icon: guild.iconURL({ size: 128 }),
                    memberCount: guild.memberCount
                });
                logger_1.log.info(`[AUTO-SYNC] Guild ${guild.name} sincronizada.`);
            }
            catch (err) {
                if (err.response?.status === 404) {
                    logger_1.log.warn(`[AUTO-SYNC] Guild ${guild.name} (${id}) não vinculada no Dashboard.`);
                }
                else {
                    logger_1.log.error(`[AUTO-SYNC] Erro ao sincronizar ${guild.name}: ${err.message}`);
                }
            }
        }
    }
};
