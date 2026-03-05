"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCommands = loadCommands;
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
/* FIX C7: readdirSync → fs.promises.readdir (não bloqueia event loop) */
async function loadCommands(client) {
    client.commands = new discord_js_1.Collection();
    const commandsPath = path_1.default.join(__dirname, '..', 'commands');
    const ext = __filename.endsWith('.ts') ? '.ts' : '.js';
    const commandFiles = (await fs_1.default.promises.readdir(commandsPath)).filter(f => f.endsWith(ext));
    let count = 0;
    for (const file of commandFiles) {
        /* FIX C8: try/catch por arquivo — falha em um não interrompe os demais */
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command = require(path_1.default.join(commandsPath, file)).default;
            if (command?.data && typeof command?.execute === 'function') {
                client.commands.set(command.data.name, command);
                count++;
            }
        }
        catch (err) {
            logger_1.log.error(`[COMMANDS] Falha ao carregar ${file}: ${err.message}`);
        }
    }
    logger_1.log.info(`${count} comando(s) carregado(s).`);
}
