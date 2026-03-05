"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEvents = loadEvents;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
/* FIX C7+C8: async readdir + try/catch por arquivo */
async function loadEvents(client) {
    const eventsPath = path_1.default.join(__dirname, '..', 'events');
    const ext = __filename.endsWith('.ts') ? '.ts' : '.js';
    const eventFiles = (await fs_1.default.promises.readdir(eventsPath)).filter(f => f.endsWith(ext));
    let count = 0;
    for (const file of eventFiles) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const event = require(path_1.default.join(eventsPath, file)).default;
            if (!event?.name)
                continue;
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            }
            else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            count++;
        }
        catch (err) {
            logger_1.log.error(`[EVENTS] Falha ao carregar ${file}: ${err.message}`);
        }
    }
    logger_1.log.info(`${count} evento(s) carregado(s).`);
}
