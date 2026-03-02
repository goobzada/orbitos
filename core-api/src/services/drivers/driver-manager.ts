import { eventBus } from '../event-bus';
import { discordDriver } from './discord.driver';
import { minecraftDriver } from './minecraft.driver';
import { fivemDriver } from './fivem.driver';
import { rconDriver } from './rcon.driver';
import { sshDriver } from './ssh.driver';

export interface ActionPayload {
    driver: string;
    action: string;
    organizationId: string;
    serverId: string;
    data: any;
}

export class DriverManager {
    async executeAction(payload: ActionPayload): Promise<any> {
        console.log(`[DRIVER MANAGER] 🛠️ Despachando ação: ${payload.driver}.${payload.action}`);

        switch (payload.driver) {
            case 'discord':
                return await discordDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'minecraft':
                return await minecraftDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'fivem':
                return await fivemDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'rcon':
                return await rconDriver.execute({
                    serverId: payload.serverId,
                    action: payload.action,
                    params: payload.data
                });
            case 'ssh':
                return await sshDriver.execute({
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

export const driverManager = new DriverManager();

