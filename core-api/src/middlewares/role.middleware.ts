import { Request, Response, NextFunction } from 'express';

/**
 * 🔒 Role Middleware – Protege rotas por nível de plataforma
 * 
 * Uso:
 *   router.get('/admin-only', authMiddleware, requireRole('SUPER_ADMIN'), controller.action)
 */
export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.user?.role;

        if (!userRole) {
            res.status(401).json({ error: 'Não autenticado.' });
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            console.warn(`[RBAC] ⛔ Acesso negado. User ${req.user?.id} (role: ${userRole}) tentou acessar rota restrita a: [${allowedRoles.join(', ')}]`);
            res.status(403).json({ error: 'FORBIDDEN – Permissão insuficiente para esta operação.' });
            return;
        }

        next();
    };
};
