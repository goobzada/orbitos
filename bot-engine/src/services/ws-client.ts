import WebSocket from 'ws';
import { Client } from 'discord.js';
import { log } from '../utils/logger';
import { loadBotEnv } from '../utils/load-env';

loadBotEnv();

function resolveWsBaseUrl(): string {
    const explicit = (process.env.CORE_API_WS_URL || '').trim();
    if (explicit) {
        return explicit.replace(/\/+$/, '');
    }

    const httpBase = (process.env.CORE_API_URL || 'http://localhost:4000').trim().replace(/\/+$/, '');
    const withoutApiSuffix = httpBase.replace(/\/api$/i, '');
    const wsRoot = withoutApiSuffix.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
    return `${wsRoot}/ws/bot`;
}

export class CommunityWSClient {
    private ws: WebSocket | null = null;
    private discordClient: Client | null = null;
    private moduleLoader: any = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 20;

    init(discordClient: Client, moduleLoader: any) {
        this.discordClient = discordClient;
        this.moduleLoader = moduleLoader;
        this.connect();
    }

    private connect() {
        const botWsToken = process.env.BOT_INTERNAL_TOKEN || 'dev-bot-ws-token-123';
        const wsBaseUrl = resolveWsBaseUrl();
        const url = `${wsBaseUrl}?token=${encodeURIComponent(botWsToken)}`;

        log.info(`[WS CLIENT] 🔌 Conectando ao Core API...`);
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
            log.info('[WS CLIENT] ✅ Conectado e autenticado ao Core API!');
            this.reconnectAttempts = 0;
        });

        this.ws.on('message', (data) => {
            try {
                const { type, payload } = JSON.parse(data.toString());
                this.handleMessage(type, payload);
            } catch {
                log.error('[WS CLIENT] ❌ Erro ao processar mensagem JSON');
            }
        });

        this.ws.on('close', (code) => {
            if (code === 1006) {
                log.warn('[WS CLIENT] ⛔ Conexão recusada — token pode estar inválido.');
            }

            this.reconnectAttempts++;
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                log.error('[WS CLIENT] 🔴 Máximo de tentativas de reconexão atingido. Verifique BOT_INTERNAL_TOKEN.');
                return;
            }

            const delay = Math.min(5000 * this.reconnectAttempts, 30000);
            log.warn(`[WS CLIENT] 🔌 Reconectando em ${delay / 1000}s... (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), delay);
        });

        this.ws.on('error', (err) => {
            log.error(`[WS CLIENT] ❌ WebSocket error: ${err.message}`);
            // Error will trigger close event, which handles reconnection
        });
    }

    private async handleMessage(type: string, payload: any) {
        if (type === 'DISCORD_ACTION' || type === 'RCON_ACTION' || type === 'MINECRAFT_ACTION' || type === 'FIVEM_ACTION') {
            const { serverId, userId, action, params } = payload;
            log.info(`[WS CLIENT] 🚀 Ação recebida [${type}]: ${action} no server ${serverId}`);

            // 1. Tentar despachar via ModuleLoader (Novo padrão extensível)
            if (this.moduleLoader) {
                const handled = await this.moduleLoader.dispatchAction(action, params);
                if (handled) return;
            }

            // 2. Fallback para ações hardcoded legadas
            const guild = this.discordClient?.guilds.cache.get(serverId);
            if (!guild) return log.error(`[WS CLIENT] ❌ Servidor ${serverId} não encontrado.`);

            try {
                switch (action) {
                    case 'add_role': {
                        const member = await guild.members.fetch(userId);
                        await member.roles.add(params.roleId);
                        log.info(`[WS CLIENT] ✅ Role ${params.roleId} adicionada a ${member.user.tag}`);
                        break;
                    }
                    case 'remove_role': {
                        const member = await guild.members.fetch(userId);
                        await member.roles.remove(params.roleId);
                        log.info(`[WS CLIENT] ✅ Role ${params.roleId} removida de ${member.user.tag}`);
                        break;
                    }
                    case 'send_message': {
                        const channel = await guild.channels.fetch(params.channelId);
                        if (channel?.isTextBased()) {
                            await (channel as any).send(params.content);
                            log.info(`[WS CLIENT] ✅ Mensagem enviada para canal ${params.channelId}`);
                        }
                        break;
                    }
                    case 'delete_channel': {
                        const channel = await guild.channels.fetch(params.channelId);
                        if (channel) {
                            await channel.delete();
                            log.info(`[WS CLIENT] ✅ Canal ${params.channelId} excluído.`);
                        }
                        break;
                    }
                    case 'ticket.close_ticket_flow': {
                        // Fallback hardcoded: avisa no canal e deleta após 10s
                        log.info(`[WS CLIENT] 🔐 Fechando ticket no canal ${params.channelId}`);
                        try {
                            const channel = await guild.channels.fetch(params.channelId);
                            if (channel?.isTextBased()) {
                                await (channel as any).send(
                                    `**[Staff] ${params.staffName || 'Staff'}** fechou este ticket pelo Dashboard. Este canal será excluído em 10 segundos.`
                                );
                            }
                            setTimeout(async () => {
                                try {
                                    const ch = await guild.channels.fetch(params.channelId).catch(() => null);
                                    if (ch) await ch.delete();
                                    log.info(`[WS CLIENT] 🗑️ Canal de ticket deletado: ${params.channelId}`);
                                } catch (e) {
                                    log.error(`[WS CLIENT] ❌ Erro ao deletar canal: ${e}`);
                                }
                            }, 10000);
                        } catch (e) {
                            log.error(`[WS CLIENT] ❌ Erro no close_ticket_flow: ${e}`);
                        }
                        break;
                    }
                    default:
                        log.warn(`[WS CLIENT] ⚠️ Ninguém soube processar a ação: ${action}`);
                }
            } catch (err: any) {
                log.error(`[WS CLIENT] ❌ Erro ao executar ${action}: ${err.message}`);
            }
        }
    }
}

export const communityWSClient = new CommunityWSClient();
