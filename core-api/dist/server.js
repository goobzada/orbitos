"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
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
const ws_server_1 = require("./services/ws-server");
const webhook_controller_1 = require("./controllers/webhook.controller");
console.log('[CORE API] Community OS Engines: EventBus, AutomationEngine e Driver Layer inicializados.');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// ── CORS ─────────────────────────────────────────────────────────────────────
// Origem explícita (não wildcard) é necessária quando credentials: true,
// pois o browser bloqueia cookies com Access-Control-Allow-Origin: *
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((o) => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permite requisições sem origin (ex: curl, Postman, server-to-server)
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
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
app.use('/webhook/stripe', express_1.default.raw({ type: 'application/json' }), webhook_controller_1.WebhookController.handleStripe);
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
            connectedAgents: ws_server_1.communityWSServer.getConnectedAgents()
        }
    });
});
// 🛰️ Agent Status — Lista os Orbit Agents conectados
app.get('/agents/status', (req, res) => {
    const agents = ws_server_1.communityWSServer.getConnectedAgents();
    res.json({
        online: agents.length > 0,
        count: agents.length,
        agents,
        ts: new Date().toISOString()
    });
});
// Middleware de Erros Globais
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});
// ── HTTP + WebSocket Server ──────────────────────────────
const server = http_1.default.createServer(app);
ws_server_1.communityWSServer.init(server);
server.listen(PORT, () => {
    console.log(`[CORE API] 🚀 Servidor rodando na porta ${PORT}`);
});
