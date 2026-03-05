import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisConnection, REDIS_ENABLED, isRedisConnected } from '../lib/redis';
import { InMemoryRateLimiter } from '../lib/in-memory-rate-limiter';

// Redis-based limiters (primary)
const globalLimiter = REDIS_ENABLED && redisConnection ? new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_global',
    points: 100,
    duration: 1,
}) : null;

const orgLimiter = REDIS_ENABLED && redisConnection ? new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_org',
    points: 20,
    duration: 1,
}) : null;

const internalLimiter = REDIS_ENABLED && redisConnection ? new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'rl_internal',
    points: 500,
    duration: 1,
}) : null;

// In-memory fallback limiters (when Redis is down)
const fallbackGlobalLimiter = new InMemoryRateLimiter(100, 1);
const fallbackOrgLimiter = new InMemoryRateLimiter(20, 1);
const fallbackInternalLimiter = new InMemoryRateLimiter(500, 1);

let redisDownWarningLogged = false;


export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    // OAuth endpoints can trigger multiple rapid redirects; avoid blocking login flow.
    if (req.path === '/auth/discord' || req.path === '/auth/callback' || req.path === '/auth/discord/callback') {
        return next();
    }

    // Health/session/dashboard read endpoints should not be blocked by global limiter.
    // Keep protection on write-heavy/mutation endpoints.
    const noLimitReadPrefixes = [
        '/health',
        '/auth/me',
        '/auth/discord/check-credentials',
        '/organizations/me',
        '/servers',
        '/stats/',
    ];
    if (req.method === 'GET' && noLimitReadPrefixes.some((prefix) => req.path.startsWith(prefix))) {
        return next();
    }

    const usingFallback = !REDIS_ENABLED || !redisConnection || !isRedisConnected();

    // Log warning once when Redis is down (avoid spam)
    if (usingFallback && !redisDownWarningLogged) {
        console.warn('[RATE LIMIT] ⚠️ Redis unavailable - using in-memory fallback rate limiter');
        redisDownWarningLogged = true;
    }

    // Reset warning flag when Redis reconnects
    if (!usingFallback && redisDownWarningLogged) {
        console.log('[RATE LIMIT] ✅ Redis reconnected - using Redis-based rate limiter');
        redisDownWarningLogged = false;
    }

    try {
        // Behind Cloudflare, req.ip can collapse to edge IP without realip config.
        // Prefer cf-connecting-ip so rate limiting stays per-user.
        const cfIpHeader = req.headers['cf-connecting-ip'];
        const realClientIp = Array.isArray(cfIpHeader) ? cfIpHeader[0] : cfIpHeader;
        const ip = realClientIp || req.ip || 'unknown';

        // 1. Apply global rate limit per IP
        if (usingFallback) {
            await fallbackGlobalLimiter.consume(ip);
        } else if (globalLimiter) {
            await globalLimiter.consume(ip);
        }

        // 2. Internal routes - apply service rate limit
        if (req.path.startsWith('/internal')) {
            if (usingFallback) {
                await fallbackInternalLimiter.consume('bot-engine');
            } else if (internalLimiter) {
                await internalLimiter.consume('bot-engine');
            }
            return next();
        }

        // 3. Organization-specific rate limit
        const orgId = req.params.orgId || req.body.organizationId || req.query.orgId;
        if (orgId) {
            if (usingFallback) {
                await fallbackOrgLimiter.consume(String(orgId));
            } else if (orgLimiter) {
                await orgLimiter.consume(String(orgId));
            }
        }

        next();
    } catch (rejRes: any) {
        res.status(429).json({
            error: 'Muitas requisições. Por favor, aguarde.',
            retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1
        });
    }
};
