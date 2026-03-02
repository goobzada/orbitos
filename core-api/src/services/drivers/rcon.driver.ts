import { eventBus } from '../event-bus';

// 🎮 RCON Driver V2
// Executa comandos de jogo em servidores remotos (FiveM, Minecraft, Rust, etc.)
// via Orbit Agent SDK com comunicação bidirecional.

export class RconDriver {
    async execute(payload: any): Promise<{ status: string; output?: string; error?: string }> {
        const { serverId, action, params } = payload;
        const { command, host, port, password } = params;

        console.log(`[DRIVER RCON] 🎮 Executando: ${action} em ${host}:${port} — Comando: ${command}`);

        try {
            const { communityWSServer } = await import('../ws-server');

            const agentOnline = communityWSServer.isAgentConnected(serverId);

            if (!agentOnline) {
                // Fallback: broadcast genérico para o Bot Engine
                console.warn(`[DRIVER RCON] ⚠️  Sem Agent local para Server ${serverId}. Usando broadcast fallback para Bot Engine.`);

                communityWSServer.broadcastToTarget(serverId, 'RCON_ACTION', {
                    serverId,
                    host,
                    port,
                    password,
                    action: 'EXECUTE_COMMAND',
                    params: { command }
                });

                eventBus.emitEvent('driver.execution.dispatched', { driver: 'rcon', action, payload, mode: 'broadcast-fallback' });

                return { status: 'DISPATCHED', output: 'Comando RCON enviado via broadcast. Resposta assíncrona.' };
            }

            // ✅ Agent online — aguarda resposta em até 15s (RCON é mais rápido que SSH)
            const response = await communityWSServer.sendAndAwaitResponse(
                serverId,
                'RCON_ACTION',
                {
                    serverId,
                    host,
                    port,
                    password,
                    action: 'EXECUTE_COMMAND',
                    params: { command }
                },
                15000
            );

            if (response.status === 'SUCCESS') {
                console.log(`[DRIVER RCON] ✅ Resposta RCON: ${response.output?.slice(0, 200) || '(sem output)'}`);

                eventBus.emitEvent('driver.execution.success', {
                    driver: 'rcon', action, output: response.output, payload
                });

                return { status: 'SUCCESS', output: response.output };
            } else {
                console.error(`[DRIVER RCON] ❌ Agent reportou ${response.status}: ${response.error}`);

                eventBus.emitEvent('driver.execution.failed', {
                    driver: 'rcon', action, error: response.error, payload
                });

                return { status: response.status, error: response.error };
            }

        } catch (error: any) {
            console.error(`[DRIVER RCON] ❌ Erro crítico: ${error.message}`);

            eventBus.emitEvent('driver.execution.failed', {
                driver: 'rcon', action, error: error.message
            });

            return { status: 'ERROR', error: error.message };
        }
    }
}

export const rconDriver = new RconDriver();
