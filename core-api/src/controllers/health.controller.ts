import { Request, Response } from 'express';
import { isRedisConnected } from '../lib/redis';
import prisma from '../lib/prisma';

export class HealthController {
    static async check(req: Request, res: Response) {
        const checks = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: { status: 'unknown' as 'healthy' | 'unhealthy' | 'unknown' },
                redis: { status: 'unknown' as 'healthy' | 'unhealthy' | 'unknown', usingFallback: false }
            }
        };

        // Check database connection
        try {
            await prisma.$queryRaw`SELECT 1`;
            checks.services.database.status = 'healthy';
        } catch (error) {
            checks.services.database.status = 'unhealthy';
            checks.status = 'degraded';
        }

        // Check Redis connection
        const redisConnected = isRedisConnected();
        checks.services.redis.status = redisConnected ? 'healthy' : 'unhealthy';
        checks.services.redis.usingFallback = !redisConnected;

        if (!redisConnected) {
            checks.status = 'degraded'; // Still operational but using fallback
        }

        // FIX: Return 200 even when degraded (Redis fallback), only 503 if database is down
        const statusCode = checks.services.database.status === 'unhealthy' ? 503 : 200;
        res.status(statusCode).json(checks);
    }
}
