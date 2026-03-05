import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { clientSpec, adminSpec } from '../docs/openapi.spec';
import { authMiddleware } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';

const router = Router();

// ─── Opções de UI compartilhadas ──────────────────────────
const baseUiOptions = {
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin-bottom: 24px; }
        body { font-family: 'Inter', sans-serif; background: #0f0f13; color: #e2e8f0; }
        .swagger-ui { background: #0f0f13; }
        .swagger-ui .opblock-tag { color: #a78bfa; font-weight: 700; border-bottom: 1px solid #2d2d3d; }
        .swagger-ui .opblock .opblock-summary-method { font-weight: 800; border-radius: 6px; }
        .swagger-ui .opblock-tag-section { margin: 16px 0; }
        .swagger-ui .info .title { color: #a78bfa; font-size: 2rem; }
        .swagger-ui .scheme-container { background: #1a1a2e; border: 1px solid #2d2d3d; padding: 16px; border-radius: 12px; }
        .swagger-ui .opblock-description-wrapper p { color: #94a3b8; }
        .swagger-ui .btn.authorize { background: #7c3aed; border-color: #7c3aed; color: white; border-radius: 8px; }
        .swagger-ui .btn.authorize svg { fill: white; }
        .swagger-ui .btn.authorize:hover { background: #6d28d9; }
        .swagger-ui input[type=text], .swagger-ui input[type=password] { background: #1e1e2e; border: 1px solid #3d3d5c; color: #e2e8f0; border-radius: 6px; }
        .swagger-ui .model-box { background: #1a1a2e; }
        .swagger-ui table thead tr th { color: #a78bfa; }
        .swagger-ui .markdown code, .swagger-ui .renderedMarkdown code { background: #1e1e2e; color: #c084fc; padding: 2px 6px; border-radius: 4px; }
        .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #1d4ed8; }
        .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #15803d; }
        .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #b45309; }
        .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #0e7490; }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #b91c1c; }
        .swagger-ui .parameter__name { color: #c084fc; font-weight: 600; }
        .swagger-ui .parameter__type { color: #67e8f9; }
    `,
    customSiteTitle: 'OrbitOS API Docs',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        defaultModelsExpandDepth: 2,
        docExpansion: 'list',
    },
};

// ─── Middleware: só SUPER_ADMIN acessa /docs/admin ────────
const requireSuperAdmin = async (req: Request, res: Response, next: any) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] ||
            (req as any).cookies?.orbitos_token;

        if (!token) {
            return res.status(401).send(`
                <html>
                    <body style="background:#0f0f13;color:#e2e8f0;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px">
                        <h1 style="color:#f43f5e">🔒 Acesso Negado</h1>
                        <p>Você precisa de um token SUPER_ADMIN para acessar a documentação de administração.</p>
                        <code style="background:#1e1e2e;padding:8px 16px;border-radius:8px;color:#c084fc">
                            Authorization: Bearer &lt;token&gt;
                        </code>
                    </body>
                </html>
            `);
        }

        const jwt = await import('jsonwebtoken');
        const decoded: any = jwt.default.verify(token, process.env.JWT_SECRET || 'default-secret');

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role !== 'SUPER_ADMIN') {
            return res.status(403).send(`
                <html>
                    <body style="background:#0f0f13;color:#e2e8f0;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px">
                        <h1 style="color:#f43f5e">🚫 Sem Permissão</h1>
                        <p>Esta documentação exige role <strong style="color:#f59e0b">SUPER_ADMIN</strong>.</p>
                    </body>
                </html>
            `);
        }

        next();
    } catch (err) {
        return res.status(401).send('Token inválido ou expirado.');
    }
};

// ─── /docs/client — Documentação para tenants ───────────────────────────────
const clientSetup = swaggerUi.setup(clientSpec as any, {
    ...baseUiOptions,
    customSiteTitle: 'OrbitOS API — Clientes',
});

router.use('/client', swaggerUi.serveFiles(clientSpec as any, {}), clientSetup);

// Rota de spec JSON pública (para clientes integrarem com ferramentas externas)
router.get('/client/spec.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(clientSpec);
});


// ─── /docs/admin — Documentação para SUPER_ADMIN ────────────────────────────
const adminSetup = swaggerUi.setup(adminSpec as any, {
    ...baseUiOptions,
    customSiteTitle: 'OrbitOS API — Admin',
    customCss: baseUiOptions.customCss + `
        .swagger-ui .info .title { color: #f59e0b; }
        .swagger-ui .opblock-tag { color: #f59e0b; }
        .swagger-ui .btn.authorize { background: #b45309; border-color: #b45309; }
    `,
});

router.use('/admin', requireSuperAdmin, swaggerUi.serveFiles(adminSpec as any, {}), adminSetup);

// Spec JSON protegido para admin
router.get('/admin/spec.json', requireSuperAdmin, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(adminSpec);
});


// ─── /docs — Portal de seleção ───────────────────────────────────────────────
router.get('/', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OrbitOS API Docs</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            min-height: 100vh;
            background: #0f0f13;
            color: #e2e8f0;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
        }
        .container { max-width: 700px; width: 100%; text-align: center; }
        .logo {
            width: 64px; height: 64px; border-radius: 20px;
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            display: flex; align-items: center; justify-content: center;
            font-size: 32px; margin: 0 auto 24px;
        }
        h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 8px; }
        h1 span { background: linear-gradient(90deg, #a78bfa, #67e8f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: #94a3b8; font-size: 1.1rem; margin-bottom: 48px; }
        .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 600px) { .cards { grid-template-columns: 1fr; } }
        .card {
            background: #1a1a2e;
            border: 1px solid #2d2d3d;
            border-radius: 20px;
            padding: 32px 24px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
            display: block;
        }
        .card:hover { transform: translateY(-4px); border-color: #7c3aed; box-shadow: 0 12px 40px rgba(124, 58, 237, 0.15); }
        .card.admin:hover { border-color: #f59e0b; box-shadow: 0 12px 40px rgba(245, 158, 11, 0.15); }
        .card-icon { font-size: 2.5rem; margin-bottom: 16px; }
        .card h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
        .card.client h2 { color: #a78bfa; }
        .card.admin h2 { color: #f59e0b; }
        .card p { color: #94a3b8; font-size: 0.875rem; line-height: 1.6; }
        .badge {
            display: inline-block; padding: 2px 10px; border-radius: 99px;
            font-size: 0.7rem; font-weight: 700; margin-top: 12px;
            text-transform: uppercase; letter-spacing: 0.1em;
        }
        .badge.public { background: #1d4ed820; color: #60a5fa; border: 1px solid #1d4ed840; }
        .badge.restricted { background: #7c3aed20; color: #f59e0b; border: 1px solid #b4530940; }
        .footer { margin-top: 48px; color: #475569; font-size: 0.8rem; }
        .footer a { color: #7c3aed; text-decoration: none; }
        .version-info { margin-top: 20px; background: #1a1a2e; border: 1px solid #2d2d3d; border-radius: 12px; padding: 16px 24px; display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
        .vi-item { text-align: center; }
        .vi-item .vi-value { font-weight: 700; color: #a78bfa; font-size: 1.1rem; }
        .vi-item .vi-label { color: #94a3b8; font-size: 0.75rem; margin-top: 2px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1><span>OrbitOS</span> API</h1>
        <p class="subtitle">Documentação Interativa • OpenAPI 3.0</p>

        <div class="cards">
            <a href="/docs/client" class="card client">
                <div class="card-icon">👤</div>
                <h2>Documentação para Clientes</h2>
                <p>Endpoints disponíveis para uso no Dashboard do tenant. Autenticação, organizações, servidores, tickets, automações e muito mais.</p>
                <span class="badge public">🌐 Acesso Público</span>
            </a>
            <a href="/docs/admin" class="card admin">
                <div class="card-icon">🛡️</div>
                <h2>Documentação para Admins</h2>
                <p>Documentação completa incluindo rotas internas do Bot Engine, webhooks Stripe e endpoints de administração da plataforma.</p>
                <span class="badge restricted">🔒 SUPER_ADMIN</span>
            </a>
        </div>

        <div class="version-info">
            <div class="vi-item">
                <div class="vi-value">v2.0.0</div>
                <div class="vi-label">Versão da API</div>
            </div>
            <div class="vi-item">
                <div class="vi-value">OpenAPI 3.0</div>
                <div class="vi-label">Especificação</div>
            </div>
            <div class="vi-item">
                <div class="vi-value">REST + WS</div>
                <div class="vi-label">Protocolos</div>
            </div>
            <div class="vi-item">
                <div class="vi-value">JWT + Key</div>
                <div class="vi-label">Autenticação</div>
            </div>
        </div>

        <div class="footer">
            <p>Especificações disponíveis em JSON: <a href="/docs/client/spec.json">/docs/client/spec.json</a></p>
        </div>
    </div>
</body>
</html>`);
});

export default router;
