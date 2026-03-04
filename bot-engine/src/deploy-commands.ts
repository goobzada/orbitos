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
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

if (!TOKEN || !CLIENT_ID) {
    console.error('[DEPLOY] ❌ Preencha DISCORD_TOKEN e DISCORD_CLIENT_ID no .env!');
    process.exit(1);
}

console.log(`[DEPLOY] Bot Client ID: ${CLIENT_ID}`);

const commands: object[] = [];
const commandsPath = path.join(__dirname, 'commands');

// Aceita tanto .ts (tsx) quanto .js (node após build)
const commandFiles = fs.readdirSync(commandsPath)
    .filter(f => f.endsWith('.js') || f.endsWith('.ts'));

for (const file of commandFiles) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(path.join(commandsPath, file));
        const command = mod.default ?? mod;
        if (command?.data) {
            commands.push(command.data.toJSON());
            console.log(`[DEPLOY] ✔ Comando carregado: /${command.data.name}`);
        }
    } catch (err) {
        console.warn(`[DEPLOY] ⚠ Erro ao carregar ${file}:`, err);
    }
}

if (commands.length === 0) {
    console.error('[DEPLOY] ❌ Nenhum comando encontrado em', commandsPath);
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`[DEPLOY] Registrando ${commands.length} comando(s) globalmente...`);

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('[DEPLOY] ✅ Slash Commands registrados com sucesso!');
        console.log('[DEPLOY] ⏳ Comandos globais levam até 1h para aparecer em todos servidores.');
        console.log('[DEPLOY] 💡 Para registro instantâneo num servidor, use GUILD_ID=<id> npx tsx src/deploy-commands.ts');
    } catch (err) {
        console.error('[DEPLOY] ❌ Erro ao registrar comandos:', err);
        process.exit(1);
    }
})();
