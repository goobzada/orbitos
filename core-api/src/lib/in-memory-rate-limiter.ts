/**
 * In-Memory Rate Limiter Fallback
 * Used when Redis is unavailable to prevent complete rate limit bypass
 */

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

export class InMemoryRateLimiter {
    private store: Map<string, RateLimitRecord> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor(
        private points: number,
        private durationSeconds: number
    ) {
        // Cleanup expired entries every 60 seconds to prevent memory leak
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }

    async consume(key: string): Promise<void> {
        const now = Date.now();
        const record = this.store.get(key);

        if (!record || now > record.resetAt) {
            // First request or window expired - create new window
            this.store.set(key, {
                count: 1,
                resetAt: now + (this.durationSeconds * 1000)
            });
            return;
        }

        if (record.count >= this.points) {
            // Rate limit exceeded
            const msBeforeNext = record.resetAt - now;
            throw {
                msBeforeNext,
                consumed: record.count,
                limit: this.points
            };
        }

        // Increment counter
        record.count++;
        this.store.set(key, record);
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (now > record.resetAt) {
                this.store.delete(key);
            }
        }
    }

    destroy() {
        clearInterval(this.cleanupInterval);
        this.store.clear();
    }

    getStats() {
        return {
            activeKeys: this.store.size,
            points: this.points,
            durationSeconds: this.durationSeconds
        };
    }
}
