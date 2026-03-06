import { Client, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import { loadEvents } from './handlers/event-handler';
import { loadCommands } from './handlers/command-handler';
import { log } from './utils/logger';
import coreApi from './utils/api-client';
import { loadBotEnv } from './utils/load-env';
import { communityWSClient } from './services/ws-client';
import { ModuleLoader } from './modules/ModuleLoader';
import path from 'path';
import fs from 'fs';

const loadedEnvFile = loadBotEnv();
log.info(`[ENV] Loaded bot environment from ${loadedEnvFile}`);

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_TOKEN || DISCORD_TOKEN === 'sua_chave_secreta_do_bot_aqui') {
    log.error('═══════════════════════════════════════════════════════');
    log.error(' TOKEN DO DISCORD NÃO CONFIGURADO!                     ');
    log.error(' Acesse: https://discord.com/developers/applications    ');
    log.error(' Copie o Bot Token e cole em bot-engine/.env            ');
    log.error('═══════════════════════════════════════════════════════');
    process.exit(1);
}

if (!DISCORD_CLIENT_ID || DISCORD_CLIENT_ID === 'seu_client_id_aqui') {
    log.error('═══════════════════════════════════════════════════════');
    log.error(' DISCORD_CLIENT_ID NÃO CONFIGURADO!                   ');
    log.error(' Acesse: https://discord.com/developers/applications    ');
    log.error(' Copie o Client ID e cole em bot-engine/.env            ');
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

async function sendHeartbeat() {
    try {
        const guildIds = client.guilds.cache.map((g) => g.id);
        const uptime = client.uptime ?? 0;
        const ping = Math.round(client.ws.ping || 0);

        await coreApi.post('/internal/heartbeat', {
            guildIds,
            uptime,
            ping,
        });
    } catch (err: any) {
        log.warn(`[HEARTBEAT] Falha ao enviar heartbeat: ${err?.message || 'erro desconhecido'}`);
    }
}

async function start() {
    moduleLoader.loadModules();

    // Carrega os comandos no client.commands Collection
    await loadCommands(client);

    // Carrega os eventos dinamicamente da pasta /events
    await loadEvents(client);

    log.info('Conectando ao Discord...');
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
}

start();
