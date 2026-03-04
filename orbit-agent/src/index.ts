import WebSocket from 'ws';
import dotenv from 'dotenv';
import { exec } from 'child_process';

dotenv.config();

// ═══════════════════════════════════════════════════════════════
//  🛰️  ORBITOS AGENT SDK V2
//  Canal WebSocket seguro entre o servidor do cliente e o Orbit Cloud.
//  Permite que o painel execute ações remotas sem abrir portas inbound.
// ═══════════════════════════════════════════════════════════════

const API_URL = process.env.CORE_API_WS_URL || 'ws://127.0.0.1:4000/ws/agent';
const AGENT_TOKEN = process.env.AGENT_TOKEN || 'dev-bot-ws-token-123';
const SERVER_ID = process.env.SERVER_ID || 'local-dev-server';
const RECONNECT_DELAY_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 30000;

// 🔒 Allowlist de prefixos de comandos permitidos (segurança básica).
// Em produção, a lista deve ser carregada de variável de ambiente ou config file assinado.
const COMMAND_ALLOWLIST: string[] = [
    'systemctl',
    'pm2',
    'docker',
    'ls',
    'df',
    'free',
    'uptime',
    'cat /var/log',
    'tail',
    'echo',
    'tmux',
    'screen',
    'kill',
    'pkill',
    'service',
    'nginx',
    'certbot',
];

function isCommandAllowed(command: string): boolean {
    const trimmed = command.trim().toLowerCase();
    return COMMAND_ALLOWLIST.some(prefix => trimmed.startsWith(prefix.toLowerCase()));
}

console.log('═══════════════════════════════════════════════════════');
console.log(' 🛰️  ORBITOS AGENT SDK V2 - Inicializando...           ');
console.log(`   Server ID : ${SERVER_ID}`);
console.log(`   Orbit API  : ${API_URL}`);
console.log('═══════════════════════════════════════════════════════');

let ws: WebSocket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let isShuttingDown = false;

function sendToCloud(message: Record<string, unknown>) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.warn('[AGENT] ⚠️  Tentativa de envio sem conexão ativa.');
    }
}

function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
        sendToCloud({ type: 'AGENT_HEARTBEAT', payload: { serverId: SERVER_ID, ts: Date.now() } });
    }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

function handleCommand(type: string, payload: any) {
    console.log(`[AGENT] 📥 Comando recebido: [${type}]`);

    const correlationId: string | undefined = payload?.correlationId;
    const action: string = payload?.action || type;

    if (type === 'SSH_ACTION' || type === 'RCON_ACTION') {
        const command: string = payload?.params?.command;

        if (!command) {
            console.error('[AGENT] ❌ Comando ausente no payload.');
            sendToCloud({
                type: 'AGENT_RESPONSE',
                payload: {
                    correlationId,
                    serverId: SERVER_ID,
                    status: 'ERROR',
                    error: 'Nenhum comando fornecido no payload.',
                    action,
                    ts: Date.now(),
                }
            });
            return;
        }

        // 🔒 Segurança: Verificar allowlist antes de executar
        if (!isCommandAllowed(command)) {
            console.warn(`[AGENT] 🚫 Comando BLOQUEADO pela allowlist: ${command}`);
            sendToCloud({
                type: 'AGENT_RESPONSE',
                payload: {
                    correlationId,
                    serverId: SERVER_ID,
                    status: 'BLOCKED',
                    error: `Comando não permitido pela política de segurança do agente: "${command.split(' ')[0]}"`,
                    action,
                    command,
                    ts: Date.now(),
                }
            });
            return;
        }

        console.log(`[AGENT] ⚙️  Executando ação: ${action}`);
        console.log(`[AGENT] 📜 Comando: ${command}`);

        exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[AGENT] ❌ Falha na execução: ${error.message}`);
                sendToCloud({
                    type: 'AGENT_RESPONSE',
                    payload: {
                        correlationId,
                        serverId: SERVER_ID,
                        status: 'ERROR',
                        error: error.message,
                        stderr: stderr || null,
                        action,
                        command,
                        ts: Date.now(),
                    }
                });
                return;
            }

            if (stderr) {
                console.warn(`[AGENT] ⚠️  Stderr: ${stderr.trim()}`);
            }

            const output = stdout.trim();
            console.log(`[AGENT] ✅ Sucesso!\n${output || '(sem output)'}`);

            // ✅ Resposta bidirecional: envia resultado de volta ao Orbit Cloud
            sendToCloud({
                type: 'AGENT_RESPONSE',
                payload: {
                    correlationId,
                    serverId: SERVER_ID,
                    status: 'SUCCESS',
                    output,
                    stderr: stderr?.trim() || null,
                    action,
                    command,
                    ts: Date.now(),
                }
            });
        });

    } else {
        console.warn(`[AGENT] ⚠️  Tipo de comando desconhecido: ${type}`);
        sendToCloud({
            type: 'AGENT_RESPONSE',
            payload: {
                correlationId,
                serverId: SERVER_ID,
                status: 'UNKNOWN_TYPE',
                error: `Tipo de mensagem não suportado: ${type}`,
                ts: Date.now(),
            }
        });
    }
}

function connect() {
    if (isShuttingDown) return;

    const url = `${API_URL}?token=${encodeURIComponent(AGENT_TOKEN)}&serverId=${encodeURIComponent(SERVER_ID)}`;
    console.log(`[AGENT] 🔌 Conectando ao Orbit Cloud...`);

    ws = new WebSocket(url);

    ws.on('open', () => {
        console.log('[AGENT] ✅ Conectado! Aguardando ordens do Orbit Cloud.');
        startHeartbeat();
        // Anuncia presença
        sendToCloud({
            type: 'AGENT_READY',
            payload: { serverId: SERVER_ID, ts: Date.now(), version: '2.0.0' }
        });
    });

    ws.on('message', (data) => {
        try {
            const { type, payload } = JSON.parse(data.toString());
            // Ignorar mensagens de handshake/ack silenciosamente
            const SILENT_TYPES = ['AGENT_HEARTBEAT_ACK', 'AGENT_READY_ACK'];
            if (!SILENT_TYPES.includes(type)) {
                console.log(`[AGENT] 📨 Mensagem: ${type}`);
                handleCommand(type, payload);
            }
        } catch (err) {
            console.error('[AGENT] ❌ Erro ao processar mensagem recebida');
        }
    });

    ws.on('close', (code, reason) => {
        stopHeartbeat();
        ws = null;
        if (!isShuttingDown) {
            console.warn(`[AGENT] 🔌 Desconectado (code: ${code}). Reconectando em ${RECONNECT_DELAY_MS / 1000}s...`);
            setTimeout(connect, RECONNECT_DELAY_MS);
        }
    });

    ws.on('error', (err) => {
        console.error(`[AGENT] ❌ Erro WS: ${err.message}`);
        // O 'close' event vai lidar com o reconect
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    isShuttingDown = true;
    console.log('\n[AGENT] 🛑 Encerrando agente graciosamente...');
    stopHeartbeat();
    ws?.close(1000, 'Agent shutdown');
    process.exit(0);
});

process.on('SIGTERM', () => {
    isShuttingDown = true;
    stopHeartbeat();
    ws?.close(1000, 'Agent shutdown');
    process.exit(0);
});

connect();
