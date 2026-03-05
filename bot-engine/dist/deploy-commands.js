"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * deploy-commands.ts
 *
 * Registra os Slash Commands na API do Discord (global).
 * Execute sempre que adicionar novos comandos:
 *
 *   # Com tsx (desenvolvimento):
 *   npx tsx src/deploy-commands.ts
 *
 *   # Com node (após build):
 *   node dist/deploy-commands.js
 */
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
if (!TOKEN || !CLIENT_ID) {
    console.error('[DEPLOY] ❌ Preencha DISCORD_TOKEN e DISCORD_CLIENT_ID no .env!');
    process.exit(1);
}
console.log(`[DEPLOY] Bot Client ID: ${CLIENT_ID}`);
const commands = [];
// Resolve os paths que o build do TypeScript usa
const possiblePaths = [
    path_1.default.join(__dirname, 'commands'), // Quando rodar via npx tsx src/deploy-commands.ts
    path_1.default.join(__dirname, '..', 'commands'), // Quando rodar node dist/deploy-commands.js (no qual `__dirname` é `dist`) // AQUI o dist build guarda na subpasta!
    path_1.default.join(process.cwd(), 'dist', 'commands'), // Diretório absoluto para fallback
    path_1.default.join(process.cwd(), 'src', 'commands')
];
let commandsPath = '';
for (const p of possiblePaths) {
    if (fs_1.default.existsSync(p)) {
        commandsPath = p;
        break; // Achei a pasta correta! 
    }
}
if (!commandsPath) {
    console.error('[DEPLOY] ❌ Diretório de commands não encontrado em nenhum dos caminhos:', possiblePaths);
    process.exit(1);
}
// Aceita tanto .ts (tsx) quanto .js (node após build)
const commandFiles = fs_1.default.readdirSync(commandsPath)
    .filter(f => f.endsWith('.js') || f.endsWith('.ts'));
for (const file of commandFiles) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(path_1.default.join(commandsPath, file));
        const command = mod.default ?? mod;
        if (command?.data) {
            commands.push(command.data.toJSON());
            console.log(`[DEPLOY] ✔ Comando carregado: /${command.data.name}`);
        }
    }
    catch (err) {
        console.warn(`[DEPLOY] ⚠ Erro ao carregar ${file}:`, err);
    }
}
if (commands.length === 0) {
    console.error('[DEPLOY] ❌ Nenhum comando encontrado em', commandsPath);
    process.exit(1);
}
const rest = new discord_js_1.REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        const guildId = process.env.DISCORD_GUILD_ID;
        const scope = process.env.COMMANDS_SCOPE === 'guild' ? 'Guild' : 'Global';
        if (scope === 'Guild' && guildId) {
            console.log(`[DEPLOY] Registrando ${commands.length} comando(s) na Guilda ${guildId}...`);
            await rest.put(discord_js_1.Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: commands });
            console.log(`[DEPLOY] ✅ Slash Commands (modificados para a Guilda ${guildId}) registrados com sucesso! Instantâneo no Discord.`);
        }
        else {
            console.log(`[DEPLOY] Registrando ${commands.length} comando(s) globalmente (em todos os servidores)...`);
            await rest.put(discord_js_1.Routes.applicationCommands(CLIENT_ID), { body: commands });
            console.log('[DEPLOY] ✅ Slash Commands (Globais) registrados com sucesso!');
        }
    }
    catch (err) {
        console.error('[DEPLOY] ❌ Erro ao registrar comandos no Discord API:', err);
        console.error('[DEPLOY] ❌ Erro ao registrar comandos:', err);
        process.exit(1);
    }
})();
