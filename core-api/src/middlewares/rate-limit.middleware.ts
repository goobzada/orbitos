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
// Degraded mode is more bursty in production dashboards; keep limits higher to
// avoid blocking legitimate UI polling when Redis is unavailable.
const fallbackGlobalLimiter = new InMemoryRateLimiter(2000, 1);
const fallbackOrgLimiter = new InMemoryRateLimiter(500, 1);
const fallbackInternalLimiter = new InMemoryRateLimiter(500, 1);

let redisDownWarningLogged = false;


export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    // CORS preflight should never be throttled.
    if (req.method === 'OPTIONS') {
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
        '/agents/servers',
        '/tickets',
        '/staff',
        '/agents/status',
        '/stats/',
        '/platform',
        '/docs',
        '/automations/triggers',
        '/automations/actions',
    ];
    if (req.method === 'GET' && noLimitReadPrefixes.some((prefix) => req.path.startsWith(prefix))) {
        return next();
    }

    // Additional read routes with dynamic IDs used heavily by dashboard polling.
    const isAutomationsRead = req.method === 'GET' && /^\/automations\/[^/]+(?:\/[^/]+\/logs)?\/?$/.test(req.path);
    const isOrganizationModulesRead = req.method === 'GET' && /^\/organizations\/[^/]+\/modules\/?$/.test(req.path);
    const isOrganizationRead = req.method === 'GET' && /^\/organizations\/[^/]+(?:\/analytics)?\/?$/.test(req.path);
    if (isAutomationsRead || isOrganizationModulesRead || isOrganizationRead) {
        return next();
    }

    // Billing flows (checkout/portal/cancel/reactivate) are user-triggered and can be
    // impacted by global limiter noise; keep them outside the global throttle.
    if (req.path.startsWith('/billing/')) {
        return next();
    }

    // Settings save (including language switch) uses PATCH /organizations/:organizationId.
    // This is a low-frequency user action and should not fail due to bursty dashboard traffic.
    const isOrganizationSettingsPatch =
        req.method === 'PATCH' && /^\/organizations\/[^/]+$/.test(req.path);
    if (isOrganizationSettingsPatch) {
        return next();
    }

    // SUPER_ADMIN platform mutations (e.g., manual plan/status changes) must not
    // be blocked by shared IP bursts.
    const isPlatformOrganizationPatch =
        req.method === 'PATCH' && /^\/platform\/organizations\/[^/]+$/.test(req.path);
    if (isPlatformOrganizationPatch) {
        return next();
    }

    // Support/admin operational flows: avoid blocking server provisioning actions.
    const isServerProvisionAction = req.method === 'POST' && /^\/servers\/?$/.test(req.path);
    if (isServerProvisionAction) {
        return next();
    }

    // Module management actions from dashboard (toggle/config/reset) should not
    // fail under degraded mode due to shared in-memory limiter noise.
    const isModuleMutation =
        req.method === 'POST' && /^\/organizations\/[^/]+\/modules\/(toggle|config|reset-config)\/?$/.test(req.path);
    if (isModuleMutation) {
        return next();
    }

    const usingFallback = !REDIS_ENABLED || !redisConnection || !isRedisConnected();

    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
    const cookies = req.cookies ?? {};
    const cookieToken = cookies.token || cookies.orbitos_token || '';
    const tokenIdentity = bearerToken || cookieToken;

    // When Redis is unavailable, fail open for authenticated dashboard traffic
    // to prevent widespread false 429s behind shared reverse-proxy IPs.
    if (usingFallback && tokenIdentity) {
        return next();
    }

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
        // Behind Cloudflare/proxy, many users can collapse to the same IP.
        // Prefer auth token identity (when available), then fall back to real client IP.
        const cfIpHeader = req.headers['cf-connecting-ip'];
        const realClientIp = Array.isArray(cfIpHeader) ? cfIpHeader[0] : cfIpHeader;
        const xffHeader = req.headers['x-forwarded-for'];
        const xffRaw = Array.isArray(xffHeader) ? xffHeader[0] : xffHeader;
        const forwardedIp = xffRaw?.split(',')?.[0]?.trim();

        // Keep key short while preserving enough entropy.
        const identityKey = tokenIdentity
            ? `tok:${String(tokenIdentity).slice(-24)}`
            : `ip:${realClientIp || forwardedIp || req.ip || 'unknown'}`;

        // 1. Apply global rate limit per IP
        if (usingFallback) {
            await fallbackGlobalLimiter.consume(identityKey);
        } else if (globalLimiter) {
            await globalLimiter.consume(identityKey);
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
