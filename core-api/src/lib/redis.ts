import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisConfig = {
    maxRetriesPerRequest: null,
};

export const redisConnection = new Redis(REDIS_URL, redisConfig);

redisConnection.on('error', (err) => {
    console.error('[REDIS] ❌ Erro na conexão:', err.message);
});

redisConnection.on('connect', () => {
    console.log('[REDIS] ✅ Conectado com sucesso.');
});
