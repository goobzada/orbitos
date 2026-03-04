import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error('❌ DISCORD_TOKEN ou DISCORD_CLIENT_ID faltando.');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🧹 Iniciando limpeza de comandos para evitar duplicidade...');

        // 1. Limpa comandos da Guilda (se existir ID)
        if (GUILD_ID) {
            console.log(`Limpando comandos da guilda ${GUILD_ID}...`);
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
            console.log('✅ Comandos da guilda removidos.');
        }

        // 2. Limpa comandos Globais
        console.log('Limpando comandos globais...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
        console.log('✅ Comandos globais removidos.');

        console.log('🚀 Reiniciando registro padrão (Global)...');

        // Agora vamos chamar o deploy-commands original que o processo normal do bot usaria
        // Mas por via das dúvidas, sugerimos rodar o deploy-commands.ts logo após esse.

        console.log('\n---');
        console.log('PRONTO! O Discord agora está limpo.');
        console.log('Agora rode o deploy-commands.ts para registrar os novos comandos globais uma única vez.');
        console.log('---');

    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
    }
})();
