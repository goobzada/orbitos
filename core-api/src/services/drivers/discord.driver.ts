import { eventBus } from '../event-bus';

export interface DriverAction {
    id: string;
    organizationId: string;
    serverId: string;
    action: string;
    params: any;
    status: 'pending' | 'success' | 'failed';
}

export class DiscordDriver {
    constructor() {
        this.registerHandlers();
    }

    private registerHandlers() {
        // Escutar ordens de execução do Discord
        eventBus.on('driver.discord.execute', this.execute.bind(this));
    }

    async execute(payload: any) {
        const { serverId, userId, action, params } = payload;

        console.log(`[DRIVER DISCORD] 🚀 Executando: ${action} no servidor ${serverId} para o usuário ${userId}`);

        try {
            // 🧠 Community OS: Enviar via WebSocket para o Bot Engine (Driver Layer)
            const { communityWSServer } = await import('../ws-server');

            communityWSServer.broadcast('DISCORD_ACTION', {
                serverId,
                userId,
                action,
                params
            });

            console.log(`[DRIVER DISCORD] ✅ Ação enviada via WebSocket: ${action}`);

            eventBus.emitEvent('driver.execution.success', {
                driver: 'discord',
                action,
                payload
            });

        } catch (error: any) {
            console.error(`[DRIVER DISCORD] ❌ Erro ao executar ${action}: ${error.message}`);
            eventBus.emitEvent('driver.execution.failed', {
                driver: 'discord',
                action,
                error: error.message
            });
        }
    }
}

export const discordDriver = new DiscordDriver();
