import { Client, Collection } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { log } from '../utils/logger';

// Extende o Client com uma coleção de comandos
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, any>;
    }
}

export function loadCommands(client: Client) {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.ts'));

    let count = 0;
    for (const file of commandFiles) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = require(path.join(commandsPath, file)).default;
        if (command?.data && command?.execute) {
            client.commands.set(command.data.name, command);
            count++;
        }
    }
    log.info(`${count} comando(s) carregado(s).`);
}
