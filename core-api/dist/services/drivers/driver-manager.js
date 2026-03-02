"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverManager = exports.DriverManager = void 0;
const discord_driver_1 = require("./discord.driver");
const minecraft_driver_1 = require("./minecraft.driver");
const fivem_driver_1 = require("./fivem.driver");
const rcon_driver_1 = require("./rcon.driver");
const ssh_driver_1 = require("./ssh.driver");
class DriverManager {
    async executeAction(payload) {
        console.log(`[DRIVER MANAGER] 🛠️ Despachando ação: ${payload.driver}.${payload.action}`);
        switch (payload.driver) {
            case 'discord':
                return await discord_driver_1.discordDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'minecraft':
                return await minecraft_driver_1.minecraftDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'fivem':
                return await fivem_driver_1.fivemDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'rcon':
                return await rcon_driver_1.rconDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'ssh':
                return await ssh_driver_1.sshDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            default:
                console.warn(`[DRIVER MANAGER] ⚠️ Driver não reconhecido: ${payload.driver}`);
                return { status: 'ERROR', error: 'Driver não encontrado' };
        }
    }
}
exports.DriverManager = DriverManager;
exports.driverManager = new DriverManager();
