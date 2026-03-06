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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
const cookie_parser_1 = __importDefault(require("cookie-parser")); // ⬅️ NOVO
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const org_routes_1 = __importDefault(require("./routes/org.routes"));
const server_routes_1 = __importDefault(require("./routes/server.routes"));
const internal_routes_1 = __importDefault(require("./routes/internal.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const staff_routes_1 = __importDefault(require("./routes/staff.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const ticket_portal_routes_1 = __importDefault(require("./routes/ticket-portal.routes"));
const ticket_template_routes_1 = __importDefault(require("./routes/ticket-template.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const platform_routes_1 = __importDefault(require("./routes/platform.routes"));
const template_routes_1 = __importDefault(require("./routes/template.routes"));
const store_routes_1 = __importDefault(require("./routes/store.routes"));
const public_store_routes_1 = __importDefault(require("./routes/public-store.routes"));
const public_portal_routes_1 = __importDefault(require("./routes/public-portal.routes"));
const support_routes_1 = __importDefault(require("./routes/support.routes"));
const module_routes_1 = __importDefault(require("./routes/module.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const automation_routes_1 = __importDefault(require("./routes/automation.routes"));
const docs_routes_1 = __importDefault(require("./routes/docs.routes"));
const ws_server_1 = require("./services/ws-server");
const webhook_controller_1 = require("./controllers/webhook.controller");
console.log('[CORE API] Community OS Engines: EventBus, AutomationEngine, Driver Layer e Workers inicializados.');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Respect reverse proxy headers (Nginx/Cloudflare) so req.ip is the real client IP.
app.set('trust proxy', true);
// ── CORS ─────────────────────────────────────────────────────────────────────
// IMPORTANTE: garanta que o .env tenha ALLOWED_ORIGINS com orbitup.io
// Exemplo:
// ALLOWED_ORIGINS=https://orbitup.io,https://www.orbitup.io,http://localhost:3000,http://localhost:3001
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
    'https://orbitup.io,https://www.orbitup.io,http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((o) => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permite requisições locais ou explícitas e sem origin
        /* FIX C4: lista explícita de portas dev — não aceitar localhost:qualquer-porta */
        const DEV_LOCALHOST_PORTS = [3000, 3001, 4000];
        const isLocalhost = DEV_LOCALHOST_PORTS.some(p => origin === `http://localhost:${p}` || origin === `http://127.0.0.1:${p}`);
        if (!origin || ALLOWED_ORIGINS.includes(origin) || isLocalhost) {
            callback(null, true);
        }
        else {
            console.warn(`[CORS] Origem bloqueada: ${origin}`);
            callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-service-key'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
// Cookies (para ler orbitos_token vindo do navegador)
app.use((0, cookie_parser_1.default)());
// Health check endpoint (before rate limiting)
const health_controller_1 = require("./controllers/health.controller");
app.get('/health', health_controller_1.HealthController.check);
// 🛡️ Rate Limiting Global
const rate_limit_middleware_1 = require("./middlewares/rate-limit.middleware");
app.use(rate_limit_middleware_1.rateLimitMiddleware);
// Stripe precisa do body "raw" ANTES do express.json()
app.use('/webhook/stripe', express_1.default.raw({ type: 'application/json' }), webhook_controller_1.WebhookController.handleStripe);
// Demais rotas usam JSON
app.use(express_1.default.json());
// ── Mounting REST Routes ─────────────────────────────────
app.use('/auth', auth_routes_1.default);
app.use('/organizations', org_routes_1.default);
app.use('/organizations', module_routes_1.default);
app.use('/servers', server_routes_1.default);
app.use('/internal', internal_routes_1.default); // Bot Engine only (x-internal-service-key)
app.use('/tickets', ticket_routes_1.default);
app.use('/staff', staff_routes_1.default);
app.use('/stats', stats_routes_1.default);
app.use('/ticket-portals', ticket_portal_routes_1.default);
app.use('/ticket-templates', ticket_template_routes_1.default);
app.use('/payments', payment_routes_1.default);
app.use('/platform', platform_routes_1.default);
app.use('/templates', template_routes_1.default);
app.use('/store', store_routes_1.default);
app.use('/public/store', public_store_routes_1.default);
app.use('/public/portal', public_portal_routes_1.default);
app.use('/support', support_routes_1.default);
app.use('/billing', billing_routes_1.default);
app.use('/automations', automation_routes_1.default);
// ── API Documentation (Swagger UI) ──────────────────────
app.use('/docs', docs_routes_1.default);
// Main Healthcheck
app.get('/', (req, res) => {
    res.json({ message: '🚀 OrbitOS Core API is running!' });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        uptime: process.uptime(),
        version: '1.0.0-orbit',
        ws: {
            connectedClients: ws_server_1.communityWSServer.getConnectedCount(),
            connectedAgents: ws_server_1.communityWSServer.getConnectedAgents(),
        },
    });
});
// 🔧 DEV: Diagnóstico de credenciais Discord OAuth2
app.get('/auth/discord/check-credentials', async (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID || '';
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    const redirectUri = process.env.DISCORD_REDIRECT_URI || '';
    const configured = {
        DISCORD_CLIENT_ID: clientId ? `${clientId.slice(0, 6)}...` : '❌ AUSENTE',
        DISCORD_CLIENT_SECRET: clientSecret ? `${clientSecret.slice(0, 4)}...${clientSecret.slice(-4)}` : '❌ AUSENTE',
        DISCORD_REDIRECT_URI: redirectUri || '❌ AUSENTE',
    };
    try {
        // Testa as credenciais via client_credentials grant (não precisa de code real)
        const axios = (await Promise.resolve().then(() => __importStar(require('axios')))).default;
        const testResp = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scope: 'identify',
        }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return res.json({
            status: '✅ Credenciais válidas',
            configured,
            discord_response: { ok: true, scope: testResp.data.scope },
        });
    }
    catch (err) {
        const discordErr = err?.response?.data;
        return res.json({
            status: '❌ Credenciais inválidas',
            configured,
            discord_error: discordErr || err.message,
            fix: 'Acesse discord.com/developers/applications → OAuth2 → Reset Secret → atualize core-api/.env → reinicie a API',
        });
    }
});
// 🛰️ Agent Status — Lista os Orbit Agents conectados
app.get('/agents/status', (req, res) => {
    const agents = ws_server_1.communityWSServer.getConnectedAgents();
    res.json({
        online: agents.length > 0,
        count: agents.length,
        agents,
        ts: new Date().toISOString(),
    });
});
// 🛰️ Agent Discovery — Lista servidores ativos para o Orbit Agent Supervisor
// Autenticado com BOT_INTERNAL_TOKEN (mesmo token usado no WebSocket)
app.get('/agents/servers', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '').trim();
    const expected = process.env.BOT_INTERNAL_TOKEN;
    if (!expected || token !== expected) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const p = new PrismaClient();
        const servers = await p.server.findMany({
            select: { discordGuildId: true, name: true },
        });
        await p.$disconnect();
        return res.json(servers);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Middleware de Erros Globais
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});
// ── HTTP + WebSocket Server ──────────────────────────────
const server = http_1.default.createServer(app);
ws_server_1.communityWSServer.init(server);
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[CORE API] ❌ Porta ${PORT} já está em uso. Finalize o processo antigo ou altere PORT.`);
        process.exit(1);
    }
    console.error('[CORE API] ❌ Erro ao iniciar servidor HTTP:', err.message);
    process.exit(1);
});
server.listen(PORT, () => {
    console.log(`[CORE API] 🚀 Servidor rodando na porta ${PORT}`);
});
