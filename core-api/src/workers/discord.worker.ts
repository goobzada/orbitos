import { Worker, Job } from 'bullmq';
import { redisConnection, REDIS_ENABLED } from '../lib/redis';
import { discordDriver } from '../services/drivers/discord.driver';

/**
 * Worker responsável por processar as ações da fila 'discord-actions'.
 * Ele retira o trabalho da fila e chama o driver apropriado.
 */
export const discordWorker = REDIS_ENABLED && redisConnection
    ? new Worker(
        'discord-actions',
        async (job: Job) => {
            const { action, params, serverId, userId } = job.data;

            console.log(`[WORKER DISCORD] 🛠️ Processando Job #${job.id}: ${action}`);

            try {
                // Chama o driver de forma assíncrona (fora do ciclo de requisição HTTP)
                await discordDriver.execute({
                    action,
                    params,
                    serverId,
                    userId
                });

                return { status: 'success' };
            } catch (error: any) {
                console.error(`[WORKER DISCORD] ❌ Erro no JOB #${job.id}: ${error.message}`);
                throw error; // Lançar para o BullMQ tentar novamente se configurado
            }
        },
        { connection: redisConnection as any }
    )
    : null;

if (discordWorker) {
    discordWorker.on('completed', (job) => {
        console.log(`[WORKER DISCORD] ✅ Job #${job.id} finalizado.`);
    });

    discordWorker.on('failed', (job, err) => {
        console.error(`[WORKER DISCORD] 💀 Job #${job?.id} falhou definitivamente: ${err.message}`);
    });
}
