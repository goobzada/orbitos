"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
/**
 * 🔒 Role Middleware – Protege rotas por nível de plataforma
 *
 * Uso:
 *   router.get('/admin-only', authMiddleware, requireRole('SUPER_ADMIN'), controller.action)
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
