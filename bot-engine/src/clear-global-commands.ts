import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

if (!TOKEN || !CLIENT_ID) {
    console.error('[CLEAR] ❌ Faltou DISCORD_TOKEN ou DISCORD_CLIENT_ID no .env/env');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('[CLEAR] Limpando comandos GLOBAIS do bot...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
        console.log('[CLEAR] ✅ Comandos globais limpos com sucesso!');
    } catch (err) {
        console.error('[CLEAR] ❌ Erro ao limpar comandos globais:', err);
    }
})();
