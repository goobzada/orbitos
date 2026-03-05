import Redis from 'ioredis';

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';
const IS_PROD = process.env.NODE_ENV === 'production';

// Support both REDIS_URL (full DSN) and individual REDIS_HOST / REDIS_PORT vars.
// REDIS_URL takes precedence when set explicitly.
const REDIS_URL  = process.env.REDIS_URL  || null;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

let redisConnection: Redis | null = null;
let redisConnected = false;
let hasLoggedError = false;

if (REDIS_ENABLED) {
    const retryStrategy = (times: number): number | null => {
        if (times > 5) {
            if (!hasLoggedError) {
                console.warn('[REDIS] ⚠️ Redis not available. Using in-memory fallback for rate limiting & cache.');
                hasLoggedError = true;
            }
            // Don't exit in production — fallback to in-memory rate limiter (see rate-limit.middleware.ts)
            return null; // Stop retrying
        }
        return Math.min(times * 200, 2000); // exponential back-off up to 2 s
    };

    redisConnection = REDIS_URL
        ? new Redis(REDIS_URL, { maxRetriesPerRequest: 3, retryStrategy })
        : new Redis({ host: REDIS_HOST, port: REDIS_PORT, maxRetriesPerRequest: 3, retryStrategy });

    redisConnection.on('error', () => {
        // Suppress noisy repeated ECONNREFUSED logs — log once, then stay silent.
        if (!redisConnected && !hasLoggedError) {
            console.warn('[REDIS] ⚠️ Connection failed. Running without Redis (Degraded Mode).');
            hasLoggedError = true;
        }
        // Production fatal exit is handled in retryStrategy after retries are exhausted,
        // giving ioredis a chance to recover from transient failures before giving up.
    });

    redisConnection.on('connect', () => {
        console.log('[REDIS] ✅ Connected successfully.');
        redisConnected = true;
        hasLoggedError = false; // allow a fresh warning if connection drops later
    });

    redisConnection.on('close', () => {
        redisConnected = false;
    });
} else {
    console.warn('[REDIS] Disabled via environment flag (REDIS_ENABLED=false).');
}

/** Returns true only when the Redis client has an active, established connection. */
export function isRedisConnected(): boolean {
    return redisConnected;
}

export { redisConnection, REDIS_ENABLED };
