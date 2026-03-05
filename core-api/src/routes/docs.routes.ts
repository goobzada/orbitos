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

router.get('/admin/spec.json', requireSuperAdmin, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(adminSpec);
});

//===========================================
// PREMIUM LANDING PAGE
//===========================================
router.get('/', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OrbitOS API — Developer Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --bg: #000000;
            --surface: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: #a1a1aa;
            --accent-1: #6366f1;
            --accent-2: #8b5cf6;
            --accent-3: #06b6d4;
            --gradient-1: linear-gradient(135deg, var(--accent-1), var(--accent-2), var(--accent-3));
        }
        
        html {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }
        
        body {
            background: var(--bg);
            color: var(--text-primary);
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }
        
        /* ========== ANIMATIONS ========== */
        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(24px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes orbit {
            0% {
                transform: rotate(0deg) translateX(100px) rotate(0deg);
            }
            100% {
                transform: rotate(360deg) translateX(100px) rotate(-360deg);
            }
        }
        
        @keyframes gradient-shift {
            0%, 100% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
        }
        
        @keyframes glow-pulse {
            0%, 100% {
                opacity: 0.3;
                filter: blur(40px);
            }
            50% {
                opacity: 0.6;
                filter: blur(60px);
            }
        }
        
        /* ========== BACKGROUND ========== */
        .bg-grid {
            position: fixed;
            inset: 0;
            background-image: 
                linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
            background-size: 80px 80px;
            mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent);
            pointer-events: none;
        }
        
        .bg-orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
            animation: glow-pulse 8s ease-in-out infinite;
            pointer-events: none;
        }
        
        .bg-orb-1 {
            top: 10%;
            left: 20%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, #6366f1, transparent 70%);
            animation-delay: 0s;
        }
        
        .bg-orb-2 {
            bottom: 20%;
            right: 15%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, #8b5cf6, transparent 70%);
            animation-delay: -4s;
        }
        
        .bg-orb-3 {
            top: 50%;
            right: 30%;
            width: 350px;
            height: 350px;
            background: radial-gradient(circle, #06b6d4, transparent 70%);
            animation-delay: -2s;
        }
        
        /* ========== CONTAINER ========== */
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 100px 32px;
            position: relative;
            z-index: 1;
        }
        
        /* ========== HEADER ========== */
        .header {
            text-align: center;
            margin-bottom: 100px;
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        .logo-wrapper {
            display: inline-block;
            position: relative;
            margin-bottom: 48px;
        }
        
        .logo {
            width: 100px;
            height: 100px;
            border-radius: 30px;
            background: var(--gradient-1);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 0 0 1px rgba(255, 255, 255, 0.1),
                0 20px 40px -10px rgba(99, 102, 241, 0.5);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .logo:hover {
            transform: scale(1.1) rotate(-8deg);
        }
        
        .logo svg {
            width: 50px;
            height: 50px;
        }
        
        .status-dot {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #10b981, #34d399);
            border-radius: 50%;
            border: 4px solid var(--bg);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
            animation: glow-pulse 2s ease-in-out infinite;
        }
        
        .title {
            font-size: clamp(3rem, 6vw, 5rem);
            font-weight: 900;
            font-family: 'Space Grotesk', sans-serif;
            letter-spacing: -0.04em;
            line-height: 1;
            margin-bottom: 24px;
        }
        
        .title-gradient {
            background: var(--gradient-1);
            background-size: 200% 200%;
            animation: gradient-shift 4s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: clamp(1.125rem, 2vw, 1.5rem);
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto 40px;
            line-height: 1.6;
        }
        
        .badges {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 999px;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
            backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .badge:hover {
            background: rgba(99, 102, 241, 0.1);
            border-color: rgba(99, 102, 241, 0.3);
            color: var(--text-primary);
            transform: translateY(-2px);
        }
        
        .badge svg {
            width: 16px;
            height: 16px;
        }
        
        /* ========== CARDS ========== */
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr));
            gap: 32px;
            margin-bottom: 100px;
        }
        
        .card {
            position: relative;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 32px;
            padding: 48px;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(20px);
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
            animation-delay: 0.2s;
        }
        
        .card::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 32px;
            padding: 2px;
            background: var(--gradient-1);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.5s;
        }
        
        .card:hover::before {
            opacity: 1;
        }
        
        .card:hover {
            transform: translateY(-12px);
            box-shadow: 0 40px 80px -20px rgba(99, 102, 241, 0.3);
        }
        
        .card.admin::before {
            background: linear-gradient(135deg, #f59e0b, #fb923c);
        }
        
        .card.admin:hover {
            box-shadow: 0 40px 80px -20px rgba(245, 158, 11, 0.3);
        }
        
        .card-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 28px;
        }
        
        .card-icon {
            width: 72px;
            height: 72px;
            border-radius: 24px;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .card:hover .card-icon {
            transform: scale(1.15) rotate(-10deg);
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.4);
        }
        
        .card.admin .card-icon {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.2);
        }
        
        .card.admin:hover .card-icon {
            background: rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.4);
        }
        
        .card-icon svg {
            width: 36px;
            height: 36px;
        }
        
        .card-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6ee7b7;
        }
        
        .card-tag.restricted {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.3);
            color: #fcd34d;
        }
        
        .card-tag svg {
            width: 14px;
            height: 14px;
        }
        
        .card h2 {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
        }
        
        .card p {
            color: var(--text-secondary);
            font-size: 1.0625rem;
            line-height: 1.7;
            margin-bottom: 32px;
            flex-grow: 1;
        }
        
        .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }
        
        .card-cta {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 1rem;
            color: #a5b4fc;
            transition: gap 0.3s;
        }
        
        .card.admin .card-cta {
            color: #fcd34d;
        }
        
        .card:hover .card-cta {
            gap: 14px;
        }
        
        .card-cta svg {
            width: 20px;
            height: 20px;
        }
        
        /* ========== STATS ========== */
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px;
            margin-bottom: 80px;
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }
        
        .stat {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 36px;
            text-align: center;
            backdrop-filter: blur(12px);
            transition: all 0.3s;
        }
        
        .stat:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(99, 102, 241, 0.3);
            transform: translateY(-4px);
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 900;
            font-family: 'Space Grotesk', sans-serif;
            background: var(--gradient-1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 12px;
        }
        
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        /* ========== FOOTER ========== */
        .footer {
            text-align: center;
            padding: 64px 0 48px;
            border-top: 1px solid var(--border);
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }
        
        .footer-links {
            display: flex;
            gap: 48px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }
        
        .footer-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        
        .footer-link:hover {
            color: var(--text-primary);
        }
        
        .footer-link svg {
            width: 16px;
            height: 16px;
        }
        
        .copyright {
            color: #52525b;
            font-size: 0.875rem;
        }
        
        /* ========== RESPONSIVE ========== */
        @media (max-width: 768px) {
            .container {
                padding: 60px 20px;
            }
            
            .header {
                margin-bottom: 60px;
            }
            
            .cards {
                grid-template-columns: 1fr;
                margin-bottom: 60px;
            }
            
            .card {
                padding: 32px 24px;
            }
            
            .stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 480px) {
            .stats {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Background Effects -->
    <div class="bg-grid"></div>
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>
    
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="logo-wrapper">
                <div class="logo">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fill-opacity="0.9"/>
                        <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="status-dot"></div>
            </div>
            
            <h1 class="title">
                <span class="title-gradient">OrbitOS</span> API
            </h1>
            
            <p class="subtitle">
                Enterprise-grade REST API for Discord automation, ticketing, and community management. Built for scale with OpenAPI 3.0.
            </p>
            
            <div class="badges">
                <div class="badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                    Live
                </div>
                <div class="badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    JWT Secured
                </div>
                <div class="badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    REST + WebSocket
                </div>
            </div>
        </header>
        
        <!-- API Cards -->
        <div class="cards">
            <a href="/docs/client" class="card">
                <div class="card-top">
                    <div class="card-icon">
                        <svg fill="none" stroke="#a5b4fc" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <div class="card-tag">
                        <svg fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                        Public
                    </div>
                </div>
                <h2>Client Documentation</h2>
                <p>
                    Complete reference for tenant dashboard integration. Includes OAuth2 authentication, organization management, Discord servers, ticketing system, automations, analytics, and Stripe billing.
                </p>
                <div class="card-footer">
                    <div class="card-cta">
                        Explore API
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </div>
                </div>
            </a>
            
            <a href="/docs/admin" class="card admin">
                <div class="card-top">
                    <div class="card-icon">
                        <svg fill="none" stroke="#fcd34d" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                    <div class="card-tag restricted">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                        Super Admin
                    </div>
                </div>
                <h2>Administration</h2>
                <p>
                    Internal platform documentation for SUPER_ADMIN access. Bot Engine endpoints, Stripe webhooks, system administration, platform metrics, debugging tools, and infrastructure management.
                </p>
                <div class="card-footer">
                    <div class="card-cta">
                        Admin Access
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </div>
                </div>
            </a>
        </div>
        
        <!-- Stats -->
        <div class="stats">
            <div class="stat">
                <div class="stat-value">v2.0</div>
                <div class="stat-label">API Version</div>
            </div>
            <div class="stat">
                <div class="stat-value">OAS 3</div>
                <div class="stat-label">Specification</div>
            </div>
            <div class="stat">
                <div class="stat-value">99.9%</div>
                <div class="stat-label">Uptime SLA</div>
            </div>
            <div class="stat">
                <div class="stat-value">&lt;50ms</div>
                <div class="stat-label">Avg Response</div>
            </div>
        </div>
        
        <!-- Footer -->
        <footer class="footer">
            <div class="footer-links">
                <a href="/docs/client/spec.json" class="footer-link">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    OpenAPI Spec
                </a>
                <a href="/health" class="footer-link">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Health Check
                </a>
                <a href="https://orbitup.io" class="footer-link" target="_blank">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Platform
                </a>
            </div>
            <p class="copyright">© 2026 OrbitOS • Powered by OrbitUp.io</p>
        </footer>
    </div>
</body>
</html>`);
});

export default router;
