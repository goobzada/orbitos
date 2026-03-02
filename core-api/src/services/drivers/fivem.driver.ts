import { eventBus } from '../event-bus';

export class FiveMDriver {
    async execute(payload: any) {
        const { serverId, action, params } = payload;
        const eventName = params.eventName || 'fivem:execute';
        const eventData = params.data || {};

        console.log(`[DRIVER FIVEM] 🏎️ Executando: ${action} no servidor ${serverId}. Evento: ${eventName}`);

        try {
            const { communityWSServer } = await import('../ws-server');

            // Broadcast para o script bridge no servidor FiveM
            communityWSServer.broadcast('FIVEM_ACTION', {
                serverId,
                action: 'EMIT_EVENT',
                params: {
                    eventName: eventName,
                    data: eventData
                }
            });

            console.log(`[DRIVER FIVEM] ✅ Evento enviado via WebSocket: ${eventName}`);

            eventBus.emitEvent('driver.execution.success', {
                driver: 'fivem',
                action,
                payload
            });

        } catch (error: any) {
            console.error(`[DRIVER FIVEM] ❌ Erro ao executar: ${error.message}`);
            eventBus.emitEvent('driver.execution.failed', {
                driver: 'fivem',
                action,
                error: error.message
            });
        }
    }
}

export const fivemDriver = new FiveMDriver();
