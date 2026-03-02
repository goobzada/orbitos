"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrgAccess = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'production'
        ? ''
        : 'dev-jwt-secret-do-not-use-in-production');
// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // 1. Sem header Authorization
    if (!authHeader) {
        console.warn('[AUTH] Requisição sem Authorization header', {
            method: req.method,
            path: req.path,
            ip: req.ip,
        });
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }
    // 2. Extrai o token do formato "Bearer <token>"
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        console.warn('[AUTH] Authorization header mal-formado', {
            method: req.method,
            path: req.path,
            authHeader: authHeader.substring(0, 30) + '...',
        });
        res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
        return;
    }
    // 3. Verifica e decodifica o JWT
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Anexa as informações do JWT para as rotas usarem via req.user
        req.user = decoded;
        return next();
    }
    catch (err) {
        console.warn('[AUTH] Token inválido ou expirado', {
            method: req.method,
            path: req.path,
            error: err.message,
        });
        res.status(401).json({ error: 'Sessão inválida, faça login novamente.' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
// ─── Require Org Access ───────────────────────────────────────────────────────
const requireOrgAccess = async (req, res, next) => {
    const userId = req.user?.id;
    const organizationId = req.params.organizationId ||
        req.body.organizationId ||
        req.query.organizationId;
    if (!userId || !organizationId) {
        return res.status(401).json({ error: 'Falta identificação de usuário ou organização.' });
    }
    // SUPER_ADMIN tem acesso global (Bypass tenant isolation)
    if (req.user?.role === 'SUPER_ADMIN') {
        return next();
    }
    try {
        const prisma = (await Promise.resolve().then(() => __importStar(require('../lib/prisma')))).default;
        const isOwner = await prisma.organization.findFirst({
            where: { id: organizationId, ownerId: userId },
        });
        if (isOwner)
            return next();
        const isMember = await prisma.organizationMember.findFirst({
            where: { organizationId: organizationId, userId },
        });
        if (isMember)
            return next();
        return res.status(403).json({
            error: 'Você não tem permissão para acessar esta organização.',
        });
    }
    catch (error) {
        console.error('[AUTH] Erro ao validar acesso à organização:', error);
        return res.status(500).json({ error: 'Erro ao validar acesso à organização.' });
    }
};
exports.requireOrgAccess = requireOrgAccess;
