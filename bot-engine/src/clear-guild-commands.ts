import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error('[CLEAR] ❌ Faltou DISCORD_TOKEN, DISCORD_CLIENT_ID ou DISCORD_GUILD_ID no .env/env');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`[CLEAR] Limpando comandos da GUILDA: ${GUILD_ID}`);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
        console.log('[CLEAR] ✅ Guild commands limpos com sucesso!');
    } catch (err) {
        console.error('[CLEAR] ❌ Erro ao limpar guild commands:', err);
    }
})();
