import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { loadEvents } from './handlers/event-handler';
import { loadCommands } from './handlers/command-handler';
import { log } from './utils/logger';
import coreApi from './utils/api-client';
import { communityWSClient } from './services/ws-client';
import { ModuleLoader } from './modules/ModuleLoader';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN || DISCORD_TOKEN === 'sua_chave_secreta_do_bot_aqui') {
    log.error('═══════════════════════════════════════════════════════');
    log.error(' TOKEN DO DISCORD NÃO CONFIGURADO!                     ');
    log.error(' Acesse: https://discord.com/developers/applications    ');
    log.error(' Copie o Bot Token e cole em bot-engine/.env            ');
    log.error('═══════════════════════════════════════════════════════');
    process.exit(1);
}

// Instancia o client com todos os intents necessários
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,       // necessário para GuildMemberAdd
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,    // necessário para ban/kick
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Inicializa o ModuleLoader para gerenciar ações dinâmicas
export const moduleLoader = new ModuleLoader(client);
moduleLoader.loadModules();

// Carrega os comandos no client.commands Collection
loadCommands(client);

// Carrega os eventos dinamicamente da pasta /events
loadEvents(client);

// ── HEARTBEAT — Sincroniza status do bot com a API ─────────────────────
const sendHeartbeat = async () => {
    if (!client.isReady()) return;
    try {
        await coreApi.post('/internal/heartbeat', {
            guildIds: Array.from(client.guilds.cache.keys()),
            uptime: client.uptime,
            ping: client.ws.ping,
        });
        log.info(`💓 Heartbeat: ${client.guilds.cache.size} guilds | WS: ${client.ws.ping}ms`);
    } catch {
        log.warn('Heartbeat falhou — Core API offline.');
    }
};

log.info('Conectando ao Discord...');
client.on('clientReady', () => {
    sendHeartbeat();
});

client.login(DISCORD_TOKEN).then(() => {
    // Inicializar cliente WebSocket Community OS e Heartbeat APÓS o login
    communityWSClient.init(client, moduleLoader);
    setInterval(sendHeartbeat, 60 * 1000); // 1 minuto
}).catch(err => {
    log.error('═══════════════════════════════════════════════════════');
    log.error(' FALHA AO CONECTAR AO DISCORD!                          ');
    log.error(` Erro: ${err.message}`);
    log.error('═══════════════════════════════════════════════════════');
    process.exit(1);
});
