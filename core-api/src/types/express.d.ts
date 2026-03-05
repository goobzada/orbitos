import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                discordId?: string;
                role: string;
                username: string;
                avatar?: string;
                impersonatingOrgId?: string;
                supportSessionId?: string;
            };
        }
    }
}
