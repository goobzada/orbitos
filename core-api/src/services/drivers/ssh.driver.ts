import { eventBus } from '../event-bus';

// 🚀 SSH Driver V2
// Gerencia execução de comandos em servidores remotos via Orbit Agent SDK.
// Utiliza comunicação bidirecional (Promise-based) com timeout e fallback.

export class SshDriver {
    async execute(payload: any): Promise<{ status: string; output?: string; error?: string }> {
        const { serverId, action, params } = payload;
        const { command } = params;

        console.log(`[DRIVER SSH] 🛡️ Executando: ${action} em Server ${serverId}. Comando: ${command}`);

        try {
            const { communityWSServer } = await import('../ws-server');

            // Verificar se o Agent está online para este servidor
            const agentOnline = communityWSServer.isAgentConnected(serverId);

            if (!agentOnline) {
                // Fallback: broadcast genérico (para o Bot Engine que pode repassar)
                console.warn(`[DRIVER SSH] ⚠️  Nenhum Agent Orbit conectado para Server ${serverId}. Usando broadcast fallback.`);

                communityWSServer.broadcastToTarget(serverId, 'SSH_ACTION', {
                    serverId,
                    action: 'EXECUTE_REMOTE',
                    params: { command }
                });

                eventBus.emitEvent('driver.execution.dispatched', { driver: 'ssh', action, payload, mode: 'broadcast-fallback' });

                return { status: 'DISPATCHED', output: 'Comando enviado via broadcast. Aguarde confirmação do agente.' };
            }

            // ✅ Agent online: aguarda resposta bidirecional (até 30s)
            console.log(`[DRIVER SSH] 📡 Agent online! Enviando e aguardando resposta...`);

            const response = await communityWSServer.sendAndAwaitResponse(
                serverId,
                'SSH_ACTION',
                {
                    serverId,
                    action: 'EXECUTE_REMOTE',
                    params: { command }
                },
                30000
            );

            if (response.status === 'SUCCESS') {
                console.log(`[DRIVER SSH] ✅ Resposta do Agent: ${response.output?.slice(0, 200) || '(sem output)'}`);

                eventBus.emitEvent('driver.execution.success', {
                    driver: 'ssh',
                    action,
                    output: response.output,
                    payload
                });

                return { status: 'SUCCESS', output: response.output };
            } else {
                console.error(`[DRIVER SSH] ❌ Agent reportou falha (${response.status}): ${response.error}`);

                eventBus.emitEvent('driver.execution.failed', {
                    driver: 'ssh',
                    action,
                    error: response.error,
                    payload
                });

                return { status: response.status, error: response.error };
            }

        } catch (error: any) {
            console.error(`[DRIVER SSH] ❌ Erro crítico: ${error.message}`);

            eventBus.emitEvent('driver.execution.failed', {
                driver: 'ssh',
                action,
                error: error.message
            });

            return { status: 'ERROR', error: error.message };
        }
    }
}

export const sshDriver = new SshDriver();
