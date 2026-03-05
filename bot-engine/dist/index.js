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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN || DISCORD_TOKEN === 'sua_chave_secreta_do_bot_aqui') {
    logger_1.log.error('═══════════════════════════════════════════════════════');
    logger_1.log.error(' TOKEN DO DISCORD NÃO CONFIGURADO!                     ');
    logger_1.log.error(' Acesse: https://discord.com/developers/applications    ');
    logger_1.log.error(' Copie o Bot Token e cole em bot-engine/.env            ');
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
exports.moduleLoader.loadModules();
// Carrega os comandos no client.commands Collection
(0, command_handler_1.loadCommands)(exports.client);
// Carrega os eventos dinamicamente da pasta /events
(0, event_handler_1.loadEvents)(exports.client);
// ── AUTO-DEPLOY de Slash Commands ────────────────────────────────────────────
const autoDeployCommands = async () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const token = process.env.DISCORD_TOKEN;
    if (!clientId || !token) {
        logger_1.log.warn('[COMMANDS] DISCORD_CLIENT_ID não definido — skip auto-deploy.');
        return;
    }
    try {
        const commandsPath = path_1.default.join(__dirname, 'commands');
        const commandFiles = fs_1.default.readdirSync(commandsPath)
            .filter(f => f.endsWith('.js') || f.endsWith('.ts'));
        const body = [];
        for (const file of commandFiles) {
            try {
                const mod = require(path_1.default.join(commandsPath, file));
                const cmd = mod.default ?? mod;
                if (cmd?.data)
                    body.push(cmd.data.toJSON());
            }
            catch { /* ignora arquivo inválido */ }
        }
        if (body.length === 0)
            return;
        const rest = new discord_js_1.REST({ version: '10' }).setToken(token);
        await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body });
        logger_1.log.info(`[COMMANDS] ✅ ${body.length} slash command(s) registrados globalmente.`);
    }
    catch (err) {
        logger_1.log.warn(`[COMMANDS] Auto-deploy falhou (não crítico): ${err?.message}`);
    }
};
// ── HEARTBEAT — Sincroniza status do bot com a API ─────────────────────
const sendHeartbeat = async () => {
    if (!exports.client.isReady())
        return;
    try {
        await api_client_1.default.post('/internal/heartbeat', {
            guildIds: Array.from(exports.client.guilds.cache.keys()),
            uptime: exports.client.uptime,
            ping: exports.client.ws.ping,
        });
        logger_1.log.info(`💓 Heartbeat: ${exports.client.guilds.cache.size} guilds | WS: ${exports.client.ws.ping}ms`);
    }
    catch {
        logger_1.log.warn('Heartbeat falhou — Core API offline.');
    }
};
logger_1.log.info('Conectando ao Discord...');
exports.client.on('clientReady', () => {
    sendHeartbeat();
    autoDeployCommands(); // registra comandos automaticamente a cada startup
});
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
