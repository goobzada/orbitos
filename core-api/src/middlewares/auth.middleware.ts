// core-api/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/* FIX C1: Sem fallback — obrigatório em todos os ambientes */
if (!process.env.JWT_SECRET) {
  throw new Error('[CONFIG] JWT_SECRET é obrigatório em todos os ambientes.');
}
const JWT_SECRET = process.env.JWT_SECRET;

// ─── Auth Middleware ──────────────────────────────────────────────────────────

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  // 1. Tenta Authorization: Bearer <token>
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const extracted = authHeader.substring(7).trim();
    if (extracted) token = extracted;
  }

  // 2. Fallback: cookie "token" (salvo pelo frontend após Discord OAuth)
  /* FIX C12: usar tipo correto em vez de (req as any).cookies */
  const cookies: Record<string, string | undefined> = req.cookies ?? {};
  if (!token && cookies.token) {
    token = cookies.token;
  }

  // 3. Fallback extra: cookie "orbitos_token" (padrão legado)
  if (!token && cookies.orbitos_token) {
    token = cookies.orbitos_token;
  }

  // 4. Nenhum token encontrado → 401
  if (!token) {
    // Silencia em produção para não poluir logs
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[AUTH] Requisição sem token (header nem cookie)', {
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
    }
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  // 5. Verifica e decodifica o JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      discordId?: string;
      role: string;
      username: string;
      avatar?: string;
      impersonatingOrgId?: string;
      supportSessionId?: string;
    };

    /* FIX C10: remocao de (req as any) apos extensao de tipo em express.d.ts */
    req.user = decoded;
    return next();
  } catch (err) {
    console.warn('[AUTH] Token inválido ou expirado', {
      method: req.method,
      path: req.path,
      error: (err as Error).message,
    });
    res.status(401).json({ error: 'Sessão inválida, faça login novamente.' });
    return;
  }
};

// ─── Require Org Access ───────────────────────────────────────────────────────

export const requireOrgAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const organizationId =
    (req.params as any).organizationId ||
    (req.body as any).organizationId ||
    (req.query as any).organizationId;

  if (!userId || !organizationId) {
    return res
      .status(401)
      .json({ error: 'Falta identificação de usuário ou organização.' });
  }

  // SUPER_ADMIN tem acesso global (Bypass tenant isolation)
  if (req.user?.role === 'SUPER_ADMIN') {
    return next();
  }

  try {
    const prisma = (await import('../lib/prisma')).default;

    const isOwner = await prisma.organization.findFirst({
      where: { id: organizationId as string, ownerId: userId },
    });

    if (isOwner) return next();

    const isMember = await prisma.organizationMember.findFirst({
      where: { organizationId: organizationId as string, userId },
    });

    if (isMember) return next();

    return res.status(403).json({
      error: 'Você não tem permissão para acessar esta organização.',
    });
  } catch (error) {
    console.error('[AUTH] Erro ao validar acesso à organização:', error);
    return res
      .status(500)
      .json({ error: 'Erro ao validar acesso à organização.' });
  }
};