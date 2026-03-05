"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleLoader = exports.client = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const event_handler_1 = require("./handlers/event-handler");
const command_handler_1 = require("./handlers/command-handler");
const logger_1 = require("./utils/logger");
const api_client_1 = __importDefault(require("./utils/api-client"));
const ws_client_1 = require("./services/ws-client");
const ModuleLoader_1 = require("./modules/ModuleLoader");
dotenv_1.default.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
if (!DISCORD_TOKEN || DISCORD_TOKEN === 'sua_chave_secreta_do_bot_aqui') {
    logger_1.log.error('═══════════════════════════════════════════════════════');
    logger_1.log.error(' TOKEN DO DISCORD NÃO CONFIGURADO!                     ');
    logger_1.log.error(' Acesse: https://discord.com/developers/applications    ');
    logger_1.log.error(' Copie o Bot Token e cole em bot-engine/.env            ');
    logger_1.log.error('═══════════════════════════════════════════════════════');
    process.exit(1);
}
if (!DISCORD_CLIENT_ID || DISCORD_CLIENT_ID === 'seu_client_id_aqui') {
    logger_1.log.error('═══════════════════════════════════════════════════════');
    logger_1.log.error(' DISCORD_CLIENT_ID NÃO CONFIGURADO!                   ');
    logger_1.log.error(' Acesse: https://discord.com/developers/applications    ');
    logger_1.log.error(' Copie o Client ID e cole em bot-engine/.env            ');
    logger_1.log.error('═══════════════════════════════════════════════════════');
    process.exit(1);
}
// Instancia o client com todos os intents necessários
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers, // necessário para GuildMemberAdd
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildModeration, // necessário para ban/kick
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction],
});
// Inicializa o ModuleLoader para gerenciar ações dinâmicas
exports.moduleLoader = new ModuleLoader_1.ModuleLoader(exports.client);
async function sendHeartbeat() {
    try {
        const guildIds = exports.client.guilds.cache.map((g) => g.id);
        const uptime = exports.client.uptime ?? 0;
        const ping = Math.round(exports.client.ws.ping || 0);
        await api_client_1.default.post('/internal/heartbeat', {
            guildIds,
            uptime,
            ping,
        });
    }
    catch (err) {
        logger_1.log.warn(`[HEARTBEAT] Falha ao enviar heartbeat: ${err?.message || 'erro desconhecido'}`);
    }
}
async function start() {
    exports.moduleLoader.loadModules();
    // Carrega os comandos no client.commands Collection
    await (0, command_handler_1.loadCommands)(exports.client);
    // Carrega os eventos dinamicamente da pasta /events
    await (0, event_handler_1.loadEvents)(exports.client);
    logger_1.log.info('Conectando ao Discord...');
    exports.client.login(DISCORD_TOKEN).then(() => {
        // Inicializar cliente WebSocket Community OS e Heartbeat APÓS o login
        ws_client_1.communityWSClient.init(exports.client, exports.moduleLoader);
        setInterval(sendHeartbeat, 60 * 1000); // 1 minuto
    }).catch(err => {
        logger_1.log.error('═══════════════════════════════════════════════════════');
        logger_1.log.error(' FALHA AO CONECTAR AO DISCORD!                          ');
        logger_1.log.error(` Erro: ${err.message}`);
        logger_1.log.error('═══════════════════════════════════════════════════════');
        process.exit(1);
    });
}
start();
