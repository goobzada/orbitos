export { };

declare global {
    namespace Express {
        export interface Request {
            user?: {
                id: string;
                discordId?: string;
                role: string;
                username: string;
                avatar?: string;
            };
        }
    }
}
