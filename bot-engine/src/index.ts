import { Client, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { loadEvents } from './handlers/event-handler';
import { loadCommands } from './handlers/command-handler';
import { log } from './utils/logger';
import coreApi from './utils/api-client';
import { communityWSClient } from './services/ws-client';
import { ModuleLoader } from './modules/ModuleLoader';
import path from 'path';
import fs from 'fs';

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

// ── AUTO-DEPLOY de Slash Commands ────────────────────────────────────────────
const autoDeployCommands = async () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const token = process.env.DISCORD_TOKEN;
    if (!clientId || !token) {
        log.warn('[COMMANDS] DISCORD_CLIENT_ID não definido — skip auto-deploy.');
        return;
    }

    try {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath)
            .filter(f => f.endsWith('.js') || f.endsWith('.ts'));

        const body: object[] = [];
        for (const file of commandFiles) {
            try {
                const mod = require(path.join(commandsPath, file));
                const cmd = mod.default ?? mod;
                if (cmd?.data) body.push(cmd.data.toJSON());
            } catch { /* ignora arquivo inválido */ }
        }

        if (body.length === 0) return;

        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(Routes.applicationCommands(clientId), { body });
        log.info(`[COMMANDS] ✅ ${body.length} slash command(s) registrados globalmente.`);
    } catch (err: any) {
        log.warn(`[COMMANDS] Auto-deploy falhou (não crítico): ${err?.message}`);
    }
};

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
    autoDeployCommands(); // registra comandos automaticamente a cada startup
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
