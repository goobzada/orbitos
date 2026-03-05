"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityWSClient = exports.CommunityWSClient = void 0;
const ws_1 = __importDefault(require("ws"));
const logger_1 = require("../utils/logger");
const BOT_WS_TOKEN = process.env.BOT_INTERNAL_TOKEN || 'dev-bot-ws-token-123';
const WS_BASE_URL = process.env.CORE_API_WS_URL || 'ws://localhost:4000/ws/bot';
class CommunityWSClient {
    ws = null;
    discordClient = null;
    moduleLoader = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 20;
    init(discordClient, moduleLoader) {
        this.discordClient = discordClient;
        this.moduleLoader = moduleLoader;
        this.connect();
    }
    connect() {
        const url = `${WS_BASE_URL}?token=${encodeURIComponent(BOT_WS_TOKEN)}`;
        logger_1.log.info(`[WS CLIENT] 🔌 Conectando ao Core API...`);
        this.ws = new ws_1.default(url);
        this.ws.on('open', () => {
            logger_1.log.info('[WS CLIENT] ✅ Conectado e autenticado ao Core API!');
            this.reconnectAttempts = 0;
        });
        this.ws.on('message', (data) => {
            try {
                const { type, payload } = JSON.parse(data.toString());
                this.handleMessage(type, payload);
            }
            catch {
                logger_1.log.error('[WS CLIENT] ❌ Erro ao processar mensagem JSON');
            }
        });
        this.ws.on('close', (code) => {
            if (code === 1006) {
                logger_1.log.warn('[WS CLIENT] ⛔ Conexão recusada — token pode estar inválido.');
            }
            this.reconnectAttempts++;
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                logger_1.log.error('[WS CLIENT] 🔴 Máximo de tentativas de reconexão atingido. Verifique BOT_INTERNAL_TOKEN.');
                return;
            }
            const delay = Math.min(5000 * this.reconnectAttempts, 30000);
            logger_1.log.warn(`[WS CLIENT] 🔌 Reconectando em ${delay / 1000}s... (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), delay);
        });
        this.ws.on('error', (err) => {
            logger_1.log.error(`[WS CLIENT] ❌ WebSocket error: ${err.message}`);
            // Error will trigger close event, which handles reconnection
        });
    }
    async handleMessage(type, payload) {
        if (type === 'DISCORD_ACTION' || type === 'RCON_ACTION' || type === 'MINECRAFT_ACTION' || type === 'FIVEM_ACTION') {
            const { serverId, userId, action, params } = payload;
            logger_1.log.info(`[WS CLIENT] 🚀 Ação recebida [${type}]: ${action} no server ${serverId}`);
            // 1. Tentar despachar via ModuleLoader (Novo padrão extensível)
            if (this.moduleLoader) {
                const handled = await this.moduleLoader.dispatchAction(action, params);
                if (handled)
                    return;
            }
            // 2. Fallback para ações hardcoded legadas
            const guild = this.discordClient?.guilds.cache.get(serverId);
            if (!guild)
                return logger_1.log.error(`[WS CLIENT] ❌ Servidor ${serverId} não encontrado.`);
            try {
                switch (action) {
                    case 'add_role': {
                        const member = await guild.members.fetch(userId);
                        await member.roles.add(params.roleId);
                        logger_1.log.info(`[WS CLIENT] ✅ Role ${params.roleId} adicionada a ${member.user.tag}`);
                        break;
                    }
                    case 'remove_role': {
                        const member = await guild.members.fetch(userId);
                        await member.roles.remove(params.roleId);
                        logger_1.log.info(`[WS CLIENT] ✅ Role ${params.roleId} removida de ${member.user.tag}`);
                        break;
                    }
                    case 'send_message': {
                        const channel = await guild.channels.fetch(params.channelId);
                        if (channel?.isTextBased()) {
                            await channel.send(params.content);
                            logger_1.log.info(`[WS CLIENT] ✅ Mensagem enviada para canal ${params.channelId}`);
                        }
                        break;
                    }
                    case 'delete_channel': {
                        const channel = await guild.channels.fetch(params.channelId);
                        if (channel) {
                            await channel.delete();
                            logger_1.log.info(`[WS CLIENT] ✅ Canal ${params.channelId} excluído.`);
                        }
                        break;
                    }
                    case 'ticket.close_ticket_flow': {
                        // Fallback hardcoded: avisa no canal e deleta após 10s
                        logger_1.log.info(`[WS CLIENT] 🔐 Fechando ticket no canal ${params.channelId}`);
                        try {
                            const channel = await guild.channels.fetch(params.channelId);
                            if (channel?.isTextBased()) {
                                await channel.send(`**[Staff] ${params.staffName || 'Staff'}** fechou este ticket pelo Dashboard. Este canal será excluído em 10 segundos.`);
                            }
                            setTimeout(async () => {
                                try {
                                    const ch = await guild.channels.fetch(params.channelId).catch(() => null);
                                    if (ch)
                                        await ch.delete();
                                    logger_1.log.info(`[WS CLIENT] 🗑️ Canal de ticket deletado: ${params.channelId}`);
                                }
                                catch (e) {
                                    logger_1.log.error(`[WS CLIENT] ❌ Erro ao deletar canal: ${e}`);
                                }
                            }, 10000);
                        }
                        catch (e) {
                            logger_1.log.error(`[WS CLIENT] ❌ Erro no close_ticket_flow: ${e}`);
                        }
                        break;
                    }
                    default:
                        logger_1.log.warn(`[WS CLIENT] ⚠️ Ninguém soube processar a ação: ${action}`);
                }
            }
            catch (err) {
                logger_1.log.error(`[WS CLIENT] ❌ Erro ao executar ${action}: ${err.message}`);
            }
        }
    }
}
exports.CommunityWSClient = CommunityWSClient;
exports.communityWSClient = new CommunityWSClient();
