import { Client, Collection } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { log } from '../utils/logger';

// Carrega todos os eventos dinamicamente da pasta /events
export function loadEvents(client: Client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.ts'));

    let count = 0;
    for (const file of eventFiles) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const event = require(path.join(eventsPath, file)).default;
        if (!event?.name) continue;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        count++;
    }
    log.info(`${count} evento(s) carregado(s).`);
}
