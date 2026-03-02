"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * deploy-commands.ts
 *
 * Script para registrar os Slash Commands na API do Discord.
 * Execute uma única vez (ou sempre que adicionar novos comandos):
 *
 *   npx tsx src/deploy-commands.ts
 */
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
if (!TOKEN || !CLIENT_ID) {
    console.error('[DEPLOY] Preencha DISCORD_TOKEN e DISCORD_CLIENT_ID no .env!');
    process.exit(1);
}
const commands = [];
const commandsPath = path_1.default.join(__dirname, 'commands');
const commandFiles = fs_1.default.readdirSync(commandsPath).filter(f => f.endsWith('.ts'));
for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command = require(path_1.default.join(commandsPath, file)).default;
    if (command?.data) {
        commands.push(command.data.toJSON());
        console.log(`[DEPLOY] Comando carregado: /${command.data.name}`);
    }
}
const rest = new discord_js_1.REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        console.log(`[DEPLOY] Registrando ${commands.length} comando(s)...`);
        await rest.put(discord_js_1.Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('[DEPLOY] ✅ Slash Commands registrados com sucesso!');
    }
    catch (err) {
        console.error('[DEPLOY] Erro ao registrar comandos:', err);
    }
})();
