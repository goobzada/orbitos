"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMiddleware = void 0;
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;
// 🔒 Validação na inicialização
if (!INTERNAL_KEY || INTERNAL_KEY.trim() === '') {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        console.error('═══════════════════════════════════════════════════════');
        console.error(' 🔴 FATAL: INTERNAL_SERVICE_KEY não está definida!     ');
        console.error(' A API não pode ser inicializada em produção sem esta  ');
        console.error(' variável de ambiente.                                  ');
        console.error('═══════════════════════════════════════════════════════');
        process.exit(1);
    }
    else {
        console.warn('═══════════════════════════════════════════════════════');
        console.warn(' ⚠️  AVISO: INTERNAL_SERVICE_KEY não definida!         ');
        console.warn(' Usando chave padrão DEV. NÃO USE EM PRODUÇÃO.        ');
        console.warn(' Defina INTERNAL_SERVICE_KEY no arquivo .env           ');
        console.warn('═══════════════════════════════════════════════════════');
    }
}
const RESOLVED_KEY = INTERNAL_KEY || (process.env.NODE_ENV === 'production' ? '' : 'saasbot-internal-dev-only');
const internalMiddleware = (req, res, next) => {
    const key = req.headers['x-internal-service-key'];
    if (!RESOLVED_KEY || !key || key !== RESOLVED_KEY) {
        console.warn(`[INTERNAL] ⛔ Tentativa de acesso interno com chave inválida. IP: ${req.ip}`);
        res.status(403).json({ error: 'Acesso interno restrito. Service key inválida.' });
        return;
    }
    next();
};
exports.internalMiddleware = internalMiddleware;
