import { eventBus } from '../event-bus';

export class MinecraftDriver {
    async execute(payload: any) {
        const { serverId, action, params } = payload;
        const command = params.command;

        console.log(`[DRIVER MINECRAFT] ⛏️ Executando: ${action} no servidor ${serverId}. Comando: ${command}`);

        try {
            const { communityWSServer } = await import('../ws-server');

            // Broadcast para o plugin bridge no servidor Minecraft
            communityWSServer.broadcast('MINECRAFT_ACTION', {
                serverId,
                action: 'CONSOLE_COMMAND',
                params: {
                    command: command
                }
            });

            console.log(`[DRIVER MINECRAFT] ✅ Comando enviado via WebSocket: ${command}`);

            eventBus.emitEvent('driver.execution.success', {
                driver: 'minecraft',
                action,
                payload
            });

        } catch (error: any) {
            console.error(`[DRIVER MINECRAFT] ❌ Erro ao executar: ${error.message}`);
            eventBus.emitEvent('driver.execution.failed', {
                driver: 'minecraft',
                action,
                error: error.message
            });
        }
    }
}

export const minecraftDriver = new MinecraftDriver();
