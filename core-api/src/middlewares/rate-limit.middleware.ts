import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisConnection } from '../lib/redis';

// Limite Global: 100 requisições por segundo por IP
const globalLimiter = new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_global',
    points: 100,
    duration: 1,
});

// Limite por Organização: 20 requisições por segundo (específico para rotas de Org)
const orgLimiter = new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_org',
    points: 20,
    duration: 1,
});

// Limite Interno (Bot): 500 requisições por segundo (para o Bot não travar)
const internalLimiter = new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_internal',
    points: 500,
    duration: 1,
});

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ip = req.ip || 'unknown';

        // 1. Sempre aplica o limite global por IP
        await globalLimiter.consume(ip);

        // 2. Se for rota interna, aplica limite de serviço
        if (req.path.startsWith('/internal')) {
            await internalLimiter.consume('bot-engine');
            return next();
        }

        // 3. Se houver organizationId na request, aplica limite por Org
        const orgId = req.params.orgId || req.body.organizationId || req.query.orgId;
        if (orgId) {
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
