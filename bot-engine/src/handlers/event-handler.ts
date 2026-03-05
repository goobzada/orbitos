import { Client } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { log } from '../utils/logger';

/* FIX C7+C8: async readdir + try/catch por arquivo */
export async function loadEvents(client: Client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    const ext = __filename.endsWith('.ts') ? '.ts' : '.js';
    const eventFiles = (await fs.promises.readdir(eventsPath)).filter(f => f.endsWith(ext));

    let count = 0;
    for (const file of eventFiles) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const event = require(path.join(eventsPath, file)).default;
            if (!event?.name) continue;

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            count++;
        } catch (err) {
            log.error(`[EVENTS] Falha ao carregar ${file}: ${(err as Error).message}`);
        }
    }
    log.info(`${count} evento(s) carregado(s).`);
}
