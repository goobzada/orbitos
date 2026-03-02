"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../utils/logger");
const api_client_1 = __importDefault(require("../utils/api-client"));
exports.default = {
    name: discord_js_1.Events.GuildDelete,
    once: false,
    async execute(guild) {
        logger_1.log.event(`Bot removido do servidor: ${guild.name} (${guild.id})`);
        try {
            await api_client_1.default.patch(`/internal/guilds/${guild.id}/disconnect`);
            logger_1.log.api(`Servidor ${guild.name} marcado como desconectado na Core API.`);
        }
        catch (err) {
            logger_1.log.warn(`Não foi possível notificar remoção do servidor ${guild.name}: ${err.message}`);
        }
    }
};
