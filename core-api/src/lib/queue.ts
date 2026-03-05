import { Queue, JobsOptions } from 'bullmq';
import { redisConnection, REDIS_ENABLED } from './redis';

// Criamos uma única fila principal para ações do Discord por enquanto
// Só inicializa se Redis estiver habilitado
export const discordQueue = REDIS_ENABLED && redisConnection
    ? new Queue('discord-actions', {
        connection: redisConnection as any,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    })
    : null;

/**
 * Adiciona uma ação à fila de processamento do Discord
 */
export async function addDiscordJob(action: string, payload: any, options?: JobsOptions) {
    if (!discordQueue) {
        console.warn(`[QUEUE] ⚠️ Ignorando Job '${action}' - Redis desativado.`);
        return null;
    }
    return discordQueue.add(action, payload, options);
}
