/**
 * deploy-commands.ts
 * 
 * Script para registrar os Slash Commands na API do Discord.
 * Execute uma única vez (ou sempre que adicionar novos comandos):
 * 
 *   npx tsx src/deploy-commands.ts
 */
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

if (!TOKEN || !CLIENT_ID) {
    console.error('[DEPLOY] Preencha DISCORD_TOKEN e DISCORD_CLIENT_ID no .env!');
    process.exit(1);
}

const commands: object[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.ts'));

for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command = require(path.join(commandsPath, file)).default;
    if (command?.data) {
        commands.push(command.data.toJSON());
        console.log(`[DEPLOY] Comando carregado: /${command.data.name}`);
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`[DEPLOY] Registrando ${commands.length} comando(s)...`);

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('[DEPLOY] ✅ Slash Commands registrados com sucesso!');
    } catch (err) {
        console.error('[DEPLOY] Erro ao registrar comandos:', err);
    }
})();
