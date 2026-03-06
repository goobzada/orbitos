"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityWSServer = exports.CommunityWSServer = void 0;
const ws_1 = require("ws");
const url_1 = require("url");
const events_1 = require("events");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const BOT_WS_TOKEN = process.env.BOT_INTERNAL_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production';
// 🔒 Validação na inicialização
if (!BOT_WS_TOKEN || BOT_WS_TOKEN.trim() === '') {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        console.error('═══════════════════════════════════════════════════════');
        console.error(' 🔴 FATAL: BOT_INTERNAL_TOKEN não está definida!       ');
        console.error(' WebSocket não pode operar sem autenticação em prod.   ');
        console.error('═══════════════════════════════════════════════════════');
        process.exit(1);
    }
    else {
        console.warn('═══════════════════════════════════════════════════════');
        console.warn(' ⚠️  AVISO: BOT_INTERNAL_TOKEN não definida!           ');
        console.warn(' Usando token padrão DEV. NÃO USE EM PRODUÇÃO.        ');
        console.warn(' Defina BOT_INTERNAL_TOKEN no arquivo .env             ');
        console.warn('═══════════════════════════════════════════════════════');
    }
}
const RESOLVED_TOKEN = BOT_WS_TOKEN || (process.env.NODE_ENV === 'production' ? '' : 'dev-bot-ws-token-123');
class CommunityWSServer extends events_1.EventEmitter {
    wss = null;
    clients = new Set();
    init(server) {
        this.wss = new ws_1.WebSocketServer({ noServer: true });
        server.on('upgrade', (request, socket, head) => {
            const url = new url_1.URL(request.url || '', `http://${request.headers.host}`);
            const pathname = url.pathname;
            const token = url.searchParams.get('token');
            const type = pathname === '/ws/bot' ? 'BOT' : (pathname === '/ws/agent' ? 'AGENT' : (pathname === '/ws/dashboard' ? 'DASHBOARD' : null));
            if (!type) {
                console.warn(`[WS SERVER] 🚫 Rota inválida: ${pathname}`);
                socket.destroy();
                return;
            }
            // Validação diferenciada por tipo
            if (type === 'DASHBOARD') {
                if (!token) {
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    return;
                }
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    const orgId = url.searchParams.get('orgId') || undefined;
                    this.wss.handleUpgrade(request, socket, head, (ws) => {
                        this.wss.emit('connection', ws, request, 'DASHBOARD', undefined, orgId, decoded.id);
                    });
                    return;
                }
                catch (err) {
                    console.warn(`[WS SERVER] ⛔ Dashboard JWT inválido.`);
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                    return;
                }
            }
            if (!RESOLVED_TOKEN || token !== RESOLVED_TOKEN) {
                console.warn(`[WS SERVER] ⛔ Conexão ${type} rejeitada - token inválido.`);
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
            this.wss.handleUpgrade(request, socket, head, (ws) => {
                const serverId = url.searchParams.get('serverId') || undefined;
                this.wss.emit('connection', ws, request, type, serverId);
            });
        });
        this.wss.on('connection', (ws, request, type, serverId, orgId, userId) => {
            const client = { ws, type, serverId, orgId, userId, connectedAt: Date.now(), isAlive: true };
            this.clients.add(client);
            console.log(`[WS SERVER] ✅ ${type} conectado! ${serverId ? `(Server: ${serverId})` : ''} — Total: ${this.clients.size}`);
            ws.on('pong', () => {
                client.isAlive = true;
            });
            ws.on('close', () => {
                console.log(`[WS SERVER] 🔌 ${type} desconectado.${serverId ? ` (Server: ${serverId})` : ''}`);
                this.clients.delete(client);
            });
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    const msgType = message.type || 'unknown';
                    // Silenciar heartbeats no log
                    if (msgType !== 'AGENT_HEARTBEAT') {
                        console.log(`[WS SERVER] 📥 [${type}] Mensagem: ${msgType}`);
                    }
                    // Processar mensagens do Agent
                    if (type === 'AGENT') {
                        this.handleAgentMessage(client, message);
                    }
                }
                catch {
                    console.error('[WS SERVER] ❌ Erro ao processar mensagem JSON');
                }
            });
        });
        // Loop de Keep-Alive (mata conexões fantasmas via Ping/Pong)
        setInterval(() => {
            this.clients.forEach((client) => {
                if (client.isAlive === false) {
                    console.warn(`[WS SERVER] 👻 Conexão Zumbi detectada (${client.type} ${client.serverId || ''}). Terminando WS...`);
                    client.ws.terminate();
                    this.clients.delete(client);
                    return;
                }
                client.isAlive = false;
                if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                    client.ws.ping();
                }
            });
        }, 30000);
        console.log('[WS SERVER] ✅ WebSocket Server inicializado (Bot & Agent SDK).');
    }
    handleAgentMessage(client, message) {
        const { type, payload } = message;
        switch (type) {
            case 'AGENT_READY':
                // Atualiza metadata do cliente
                client.version = payload?.version;
                // Some agent builds connect without serverId in WS query string.
                // Bind it on READY payload so status/discovery works correctly.
                if (!client.serverId && payload?.serverId) {
                    client.serverId = String(payload.serverId);
                }
                console.log(`[WS SERVER] 🛰️  Agent ${payload?.serverId || client.serverId} online (v${payload?.version || '?'}).`);
                // Confirma para o agent
                if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                    client.ws.send(JSON.stringify({ type: 'AGENT_READY_ACK', payload: { ts: Date.now() } }));
                }
                break;
            case 'AGENT_HEARTBEAT':
                // Responde com ACK e timestamp do server para sincronizar relógio
                if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                    client.ws.send(JSON.stringify({ type: 'AGENT_HEARTBEAT_ACK', payload: { serverTs: Date.now() } }));
                }
                break;
            case 'AGENT_RESPONSE':
                // ✅ Resposta de um comando executado pelo agent
                const agentResp = payload;
                const { correlationId, serverId, status, output, error, command, action } = agentResp;
                if (status === 'SUCCESS') {
                    console.log(`[WS SERVER] ✅ Agent (${serverId}) completou "${action}" — Output: ${output?.slice(0, 100) || '(vazio)'}`);
                }
                else {
                    console.warn(`[WS SERVER] ⚠️  Agent (${serverId}) reportou ${status} em "${action}": ${error}`);
                }
                // Emite evento interno para que o driver/controller possa await o resultado
                if (correlationId) {
                    this.emit(`agent_response:${correlationId}`, agentResp);
                }
                // Emite evento genérico para qualquer listener do servidor
                this.emit('agent_response', agentResp);
                break;
            default:
                // Tipo desconhecido — ignora silenciosamente
                break;
        }
    }
    // ─── Métodos de Envio ───────────────────────────────────────────
    /** Broadcast geral para todos os clientes conectados */
    broadcast(type, payload) {
        const message = JSON.stringify({ type, payload });
        this.clients.forEach((client) => {
            if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }
    /** Broadcast direcionado para um servidor específico (Agent ou Bot observando) */
    broadcastToTarget(serverId, type, payload) {
        const message = JSON.stringify({ type, payload });
        this.clients.forEach((client) => {
            if ((client.serverId === serverId || client.type === 'BOT') && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }
    /**
     * Envia um comando para um agent específico e retorna uma Promise
     * que resolve quando o agent responde ou rejeita em timeout.
     */
    sendAndAwaitResponse(serverId, type, payload, timeoutMs = 30000) {
        return new Promise((resolve, reject) => {
            const correlationId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const timer = setTimeout(() => {
                this.removeAllListeners(`agent_response:${correlationId}`);
                reject(new Error(`Agent (${serverId}) não respondeu em ${timeoutMs / 1000}s (correlationId: ${correlationId})`));
            }, timeoutMs);
            this.once(`agent_response:${correlationId}`, (response) => {
                clearTimeout(timer);
                resolve(response);
            });
            // Injeta correlationId no payload para que o agent devolva na resposta
            this.broadcastToTarget(serverId, type, { ...payload, correlationId });
        });
    }
    /** Verifica se há um agent conectado para o serverId informado */
    isAgentConnected(serverId) {
        for (const client of this.clients) {
            if (client.type === 'AGENT' && client.serverId === serverId && client.ws.readyState === ws_1.WebSocket.OPEN) {
                return true;
            }
        }
        return false;
    }
    getConnectedCount() {
        return this.clients.size;
    }
    getConnectedAgents() {
        const agents = [];
        this.clients.forEach(c => {
            if (c.type === 'AGENT' && c.serverId)
                agents.push(c.serverId);
        });
        return agents;
    }
    /** Broadcast para usuários do Dashboard vinculados a uma organização específica */
    broadcastToDashboard(orgId, type, payload) {
        const message = JSON.stringify({ type, payload });
        this.clients.forEach((client) => {
            if (client.type === 'DASHBOARD' && client.orgId === orgId && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    }
}
exports.CommunityWSServer = CommunityWSServer;
exports.communityWSServer = new CommunityWSServer();
