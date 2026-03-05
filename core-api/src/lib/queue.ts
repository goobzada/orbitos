import { Queue, JobsOptions } from 'bullmq';
import { redisConnection } from './redis';

// Criamos uma única fila principal para ações do Discord por enquanto
export const discordQueue = new Queue('discord-actions', {
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
});

/**
 * Adiciona uma ação à fila de processamento do Discord
 */
export async function addDiscordJob(action: string, payload: any, options?: JobsOptions) {
    return discordQueue.add(action, payload, options);
}
