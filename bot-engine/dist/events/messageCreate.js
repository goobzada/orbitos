"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const api_client_1 = __importDefault(require("../utils/api-client"));
const logger_1 = require("../utils/logger");
exports.default = {
    name: discord_js_1.Events.MessageCreate,
    once: false,
    async execute(message) {
        // Ignorar mensagens de bots
        if (message.author.bot)
            return;
        // Apenas mensagens enviadas em canais dentro de servidores
        if (!message.guild || message.channel.type !== discord_js_1.ChannelType.GuildText)
            return;
        // Aceitar canais que começam com "ticket-" ou "tkt-"
        if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('tkt-'))
            return;
        // Se o usu\u00e1rio tem permiss\u00e3o para gerenciar canais ou \u00e9 o Admin, marca como Staff
        const isStaff = message.member?.permissions.has('ManageChannels') || message.member?.permissions.has('Administrator') || false;
        try {
            await api_client_1.default.post('/internal/tickets/messages', {
                discordGuildId: message.guild.id,
                channelId: message.channel.id,
                authorId: message.author.id,
                authorName: message.author.username,
                authorAvatar: message.author.displayAvatarURL(),
                content: message.content,
                isStaff
            });
            logger_1.log.api(`Mensagem de ${message.author.username} recebida no ticket ${message.channel.id}.`);
        }
        catch (error) {
            // Ignora silenciosamente se der 404 (n\u00e3o \u00e9 um canal de ticket v\u00e1lido na DB)
            if (error.response && error.response.status === 404) {
                return;
            }
            logger_1.log.error(`Erro ao salvar mensagem do ticket: ${error.message}`);
        }
    }
};
