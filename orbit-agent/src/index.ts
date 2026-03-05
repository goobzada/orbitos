import WebSocket from 'ws';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import https from 'https';
import http from 'http';
import path from 'path';

// Garante que o .env é lido do diretório do próprio arquivo, não do cwd do processo
// Isso resolve o "injecting env (0)" quando o PM2 sobe com cwd diferente
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// ═══════════════════════════════════════════════════════════════
//  🛰️  ORBITOS AGENT SUPERVISOR V3
//  Processo único que gerencia TODOS os servidores automaticamente.
//  Descobre servidores via API e cria conexões WS para cada um.
//  Novos servidores são detectados a cada POLL_INTERVAL ms.
// ═══════════════════════════════════════════════════════════════

const WS_URL = process.env.CORE_API_WS_URL || 'ws://127.0.0.1:4000/ws/agent';
const HTTP_API_URL = process.env.CORE_API_HTTP_URL || 'http://127.0.0.1:4000';
const AGENT_TOKEN = process.env.AGENT_TOKEN || 'dev-bot-ws-token-123';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '30000', 10); // 30s default
const HEARTBEAT_MS = 30000;

// 🔒 Allowlist de comandos permitidos
const COMMAND_ALLOWLIST: string[] = [
    'systemctl', 'pm2', 'docker', 'ls', 'df', 'free',
    'uptime', 'cat /var/log', 'tail', 'echo', 'kill',
    'pkill', 'service', 'nginx', 'certbot', 'tmux', 'screen',
];

function isCommandAllowed(command: string): boolean {
    return COMMAND_ALLOWLIST.some(p => command.trim().toLowerCase().startsWith(p.toLowerCase()));
}

// ── Busca lista de servidores na API ───────────────────────────────────────────
async function fetchServerList(): Promise<{ discordGuildId: string; name: string }[]> {
    const base = HTTP_API_URL.replace(/\/+$/, '');
    const candidates = base.includes('/api')
        ? [`${base}/agents/servers`]
        : [`${base}/agents/servers`, `${base}/api/agents/servers`];

    const requestJson = (url: string): Promise<any> => new Promise((resolve) => {
        const isHttps = url.startsWith('https');
        const lib = isHttps ? https : http;
        const req = lib.request(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${AGENT_TOKEN}` },
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed: any = null;
                try {
                    parsed = data ? JSON.parse(data) : null;
                } catch {
                    parsed = null;
                }

                resolve({
                    statusCode: res.statusCode || 0,
                    payload: parsed,
                });
            });
        });

        req.on('error', (err) => {
            resolve({ statusCode: 0, payload: { error: err.message } });
        });

        req.end();
    });

    for (const url of candidates) {
        const resp = await requestJson(url);
        if (Array.isArray(resp.payload)) {
            return resp.payload;
        }

        if (resp.statusCode === 401 || resp.statusCode === 403) {
            console.warn(`[SUPERVISOR] ⛔ Unauthorized on ${url}. Verifique AGENT_TOKEN/BOT_INTERNAL_TOKEN.`);
        } else if (resp.statusCode >= 400) {
            console.warn(`[SUPERVISOR] ⚠ ${url} retornou HTTP ${resp.statusCode}.`);
        }
    }

    return [];
}

// ── Classe de conexão por servidor ─────────────────────────────────────────────
class ServerAgent {
    public readonly serverId: string;
    public readonly name: string;
    private ws: WebSocket | null = null;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private stopped = false;

    constructor(serverId: string, name: string) {
        this.serverId = serverId;
        this.name = name;
        this.connect();
    }

    private send(msg: Record<string, unknown>) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        }
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            this.send({ type: 'AGENT_HEARTBEAT', payload: { serverId: this.serverId, ts: Date.now() } });
        }, HEARTBEAT_MS);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; }
    }

    private handleCommand(type: string, payload: any) {
        const correlationId = payload?.correlationId;
        const action = payload?.action || type;

        if (type === 'SSH_ACTION' || type === 'RCON_ACTION') {
            const command: string = payload?.params?.command;
            if (!command) {
                this.send({ type: 'AGENT_RESPONSE', payload: { correlationId, serverId: this.serverId, status: 'ERROR', error: 'Nenhum comando fornecido.', action, ts: Date.now() } });
                return;
            }
            if (!isCommandAllowed(command)) {
                console.warn(`[${this.serverId}] 🚫 Comando bloqueado: ${command}`);
                this.send({ type: 'AGENT_RESPONSE', payload: { correlationId, serverId: this.serverId, status: 'BLOCKED', error: `Comando não permitido: "${command.split(' ')[0]}"`, action, command, ts: Date.now() } });
                return;
            }
            exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
                if (error) {
                    this.send({ type: 'AGENT_RESPONSE', payload: { correlationId, serverId: this.serverId, status: 'ERROR', error: error.message, stderr: stderr || null, action, command, ts: Date.now() } });
                    return;
                }
                this.send({ type: 'AGENT_RESPONSE', payload: { correlationId, serverId: this.serverId, status: 'SUCCESS', output: stdout.trim(), stderr: stderr?.trim() || null, action, command, ts: Date.now() } });
            });
        }
    }

    connect() {
        if (this.stopped) return;
        const url = `${WS_URL}?token=${encodeURIComponent(AGENT_TOKEN)}&serverId=${encodeURIComponent(this.serverId)}`;
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
            console.log(`[SUPERVISOR] ✅ [${this.name}] conectado`);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.send({ type: 'AGENT_READY', payload: { serverId: this.serverId, ts: Date.now(), version: '3.0.0' } });
        });

        this.ws.on('ping', () => {
            this.ws?.pong();
        });

        this.ws.on('message', (data) => {
            try {
                const { type, payload } = JSON.parse(data.toString());
                if (!['AGENT_HEARTBEAT_ACK', 'AGENT_READY_ACK'].includes(type)) {
                    this.handleCommand(type, payload);
                }
            } catch { /* ignore */ }
        });

        this.ws.on('close', (code) => {
            this.stopHeartbeat();
            this.ws = null;
            if (!this.stopped) {
                this.reconnectAttempts++;
                // Exponencial backoff até cap de 30s (ex: 2s, 4s, 8s, 16s, 30s)
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                console.warn(`[SUPERVISOR] 🔌 [${this.name}] desconectado (Code: ${code}). Reconectando em ${delay / 1000}s... (Tentativa ${this.reconnectAttempts})`);
                this.reconnectTimer = setTimeout(() => this.connect(), delay);
            }
        });

        this.ws.on('error', (err) => {
            console.error(`[SUPERVISOR] ❌ [${this.name}] WS erro: ${err.message}`);
        });
    }

    stop() {
        this.stopped = true;
        this.stopHeartbeat();
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.ws?.close(1000, 'Agent stopped');
    }
}

// ── Supervisor — gerencia o pool de conexões ───────────────────────────────────
const pool = new Map<string, ServerAgent>();

async function syncServers() {
    const servers = await fetchServerList();

    if (servers.length === 0) {
        console.warn('[SUPERVISOR] ⚠ Nenhum servidor encontrado na API (ou API offline).');
        return;
    }

    // Iniciar novas conexões
    for (const { discordGuildId, name } of servers) {
        if (!pool.has(discordGuildId)) {
            console.log(`[SUPERVISOR] 🆕 Novo servidor detectado: ${name} (${discordGuildId})`);
            pool.set(discordGuildId, new ServerAgent(discordGuildId, name));
        }
    }

    // Remover servidores que foram desativados
    const activeIds = new Set(servers.map(s => s.discordGuildId));
    for (const [id, agent] of pool) {
        if (!activeIds.has(id)) {
            console.log(`[SUPERVISOR] 🗑 Servidor removido: ${id}`);
            agent.stop();
            pool.delete(id);
        }
    }

    console.log(`[SUPERVISOR] 📡 ${pool.size} agente(s) ativo(s)`);
}

// ── Início ─────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════');
console.log(' 🛰️  ORBITOS AGENT SUPERVISOR V3');
console.log(`   API      : ${HTTP_API_URL}`);
console.log(`   WS       : ${WS_URL}`);
console.log(`   Poll     : ${POLL_INTERVAL / 1000}s`);
console.log('═══════════════════════════════════════════════════════');

// Primeira sincronização com delay para a API subir
setTimeout(async () => {
    await syncServers();
    setInterval(syncServers, POLL_INTERVAL);
}, 3000);

// Graceful shutdown
const shutdown = () => {
    console.log('\n[SUPERVISOR] 🛑 Encerrando todos os agentes...');
    for (const agent of pool.values()) agent.stop();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
