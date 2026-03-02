"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../../utils/logger");
const api_client_1 = __importDefault(require("../../utils/api-client"));
const welcome_message = {
    id: 'welcome_message',
    name: 'Mensagem de Boas-vindas',
    category: 'Onboarding',
    init: (client) => {
        client.on('guildMemberAdd', async (member) => {
            try {
                // 1. Busca quais módulos estão ativos para esse servidor
                const { data } = await api_client_1.default.get(`/internal/guilds/${member.guild.id}/modules`);
                // 2. Verifica se este módulo específico está ativo
                const moduleInfo = data.modules.find((m) => m.key === 'welcome_message');
                if (!moduleInfo)
                    return;
                const config = moduleInfo.config || {};
                const channelId = config.channelId;
                if (!channelId)
                    return;
                const channel = member.guild.channels.cache.get(channelId);
                if (!channel)
                    return;
                const welcomeEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle(config.title || 'Seja bem-vindo!')
                    .setDescription((config.description || 'Olá {user}, seja muito bem-vindo ao servidor {guild}!')
                    .replace('{user}', member.user.toString())
                    .replace('{guild}', member.guild.name)
                    .replace('{memberCount}', member.guild.memberCount.toString()))
                    .setColor(config.color || '#5865F2')
                    .setThumbnail(member.user.displayAvatarURL());
                if (config.imageUrl)
                    welcomeEmbed.setImage(config.imageUrl);
                if (config.footer)
                    welcomeEmbed.setFooter({ text: config.footer });
                await channel.send({ content: config.mentionUser ? member.user.toString() : undefined, embeds: [welcomeEmbed] });
                logger_1.log.info(`[WELCOME] ✉️ Mensagem enviada para ${member.user.tag} no servidor ${member.guild.name}`);
            }
            catch (error) {
                logger_1.log.error(`[WELCOME] ❌ Erro ao processar boas-vindas para ${member.user.tag}: ${error.message}`);
            }
        });
    },
    handleAction: async (action, params) => {
        if (action === 'dispatch_manual_welcome') {
            logger_1.log.info(`Disparando boas vindas manualmente: ${params}`);
        }
    }
};
exports.default = welcome_message;
