"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEvents = loadEvents;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
// Carrega todos os eventos dinamicamente da pasta /events
function loadEvents(client) {
    const eventsPath = path_1.default.join(__dirname, '..', 'events');
    const ext = __filename.endsWith('.ts') ? '.ts' : '.js'; // dev=.ts, prod=.js
    const eventFiles = fs_1.default.readdirSync(eventsPath).filter(f => f.endsWith(ext));
    let count = 0;
    for (const file of eventFiles) {
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
    logger_1.log.info(`${count} evento(s) carregado(s).`);
}
