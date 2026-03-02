"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../utils/logger");
const api_client_1 = __importDefault(require("../utils/api-client"));
const embeds_1 = require("../utils/embeds");
exports.default = {
    name: discord_js_1.Events.GuildCreate,
    once: false,
    async execute(guild) {
        logger_1.log.event(`Adicionado ao servidor: ${guild.name} (ID: ${guild.id}) — ${guild.memberCount} membros`);
        // 1. Tenta registrar na Core API 
        try {
            await api_client_1.default.post('/internal/guilds', {
                discordGuildId: guild.id,
                name: guild.name,
                icon: guild.iconURL({ size: 256 }),
                memberCount: guild.memberCount,
            });
            logger_1.log.api(`Servidor ${guild.name} sincronizado com a Core API.`);
        }
        catch (err) {
            logger_1.log.warn(`Não foi possível sincronizar ${guild.name} com a API: ${err?.response?.data?.error || err.message}`);
        }
        // 2. Manda embed de boas-vindas para o canal "geral" do servidor
        const systemChannel = guild.systemChannel;
        if (systemChannel?.permissionsFor(guild.members.me)?.has(discord_js_1.PermissionFlagsBits.SendMessages)) {
            await systemChannel.send({ embeds: [(0, embeds_1.guildWelcomeEmbed)(guild.name)] });
        }
    }
};
