import { Request, Response, NextFunction } from 'express';

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
    } else {
        console.warn('═══════════════════════════════════════════════════════');
        console.warn(' ⚠️  AVISO: INTERNAL_SERVICE_KEY não definida!         ');
        console.warn(' Usando chave padrão DEV. NÃO USE EM PRODUÇÃO.        ');
        console.warn(' Defina INTERNAL_SERVICE_KEY no arquivo .env           ');
        console.warn('═══════════════════════════════════════════════════════');
    }
}

export const internalMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = req.headers['x-internal-service-key'] as string;
    const RESOLVED_KEY = (process.env.INTERNAL_SERVICE_KEY || '').trim();

    // Diagnóstico temporário para resolver o problema de conexão
    const receivedSnippet = key ? `${key.substring(0, 4)}...` : 'AUSENTE';
    const expectedSnippet = RESOLVED_KEY ? `${RESOLVED_KEY.substring(0, 4)}...` : 'AUSENTE';
    
    if (!RESOLVED_KEY || !key || key.toString().trim() !== RESOLVED_KEY) {
        console.warn(`[INTERNAL] ⛔ Chave Inválida. Recebida: [${receivedSnippet}] | Esperada: [${expectedSnippet}] | IP: ${req.ip}`);
        res.status(403).json({ error: 'Acesso interno restrito. Service key inválida.' });
        return;
    }
    next();
};
