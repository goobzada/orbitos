import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisConnection, REDIS_ENABLED, isRedisConnected } from '../lib/redis';

// Limite Global: 100 requisições por segundo por IP
const globalLimiter = REDIS_ENABLED && redisConnection ? new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_global',
    points: 100,
    duration: 1,
}) : null;

// Limite por Organização: 20 requisições por segundo (específico para rotas de Org)
const orgLimiter = REDIS_ENABLED && redisConnection ? new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_org',
    points: 20,
    duration: 1,
}) : null;

// Limite Interno (Bot): 500 requisições por segundo (para o Bot não travar)
const internalLimiter = REDIS_ENABLED && redisConnection ? new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_internal',
    points: 500,
    duration: 1,
}) : null;

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting when Redis is disabled or not yet connected (avoids 429 on Redis downtime)
    if (!REDIS_ENABLED || !redisConnection || !isRedisConnected()) {
        return next();
    }

    try {
        const ip = req.ip || 'unknown';

        // 1. Sempre aplica o limite global por IP
        if (globalLimiter) await globalLimiter.consume(ip);

        // 2. Se for rota interna, aplica limite de serviço
        if (req.path.startsWith('/internal')) {
            if (internalLimiter) await internalLimiter.consume('bot-engine');
            return next();
        }

        // 3. Se houver organizationId na request, aplica limite por Org
        const orgId = req.params.orgId || req.body.organizationId || req.query.orgId;
        if (orgId && orgLimiter) {
            await orgLimiter.consume(String(orgId));
        }

        next();
    } catch (rejRes: any) {
        res.status(429).json({
            error: 'Muitas requisições. Por favor, aguarde.',
            retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1
        });
    }
};
