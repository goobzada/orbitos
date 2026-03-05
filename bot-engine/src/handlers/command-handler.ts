import { Client, Collection } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { log } from '../utils/logger';

/* FIX C16: tipagem explícita dos comandos */
export interface BotCommand {
    data: { name: string; toJSON: () => object };
    execute: (...args: any[]) => Promise<void>;
}

// Extende o Client com uma coleção tipada de comandos
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, BotCommand>;
    }
}

/* FIX C7: readdirSync → fs.promises.readdir (não bloqueia event loop) */
export async function loadCommands(client: Client) {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '..', 'commands');
    const ext = __filename.endsWith('.ts') ? '.ts' : '.js';
    const commandFiles = (await fs.promises.readdir(commandsPath)).filter(f => f.endsWith(ext));

    let count = 0;
    for (const file of commandFiles) {
        /* FIX C8: try/catch por arquivo — falha em um não interrompe os demais */
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command: BotCommand = require(path.join(commandsPath, file)).default;
            if (command?.data && command?.execute) {
                client.commands.set(command.data.name, command);
                count++;
            }
        } catch (err) {
            log.error(`[COMMANDS] Falha ao carregar ${file}: ${(err as Error).message}`);
        }
    }
    log.info(`${count} comando(s) carregado(s).`);
}
