import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import 'express-async-errors';
import cookieParser from 'cookie-parser'; // ⬅️ NOVO

dotenv.config();

import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/org.routes';
import serverRoutes from './routes/server.routes';
import internalRoutes from './routes/internal.routes';
import ticketRoutes from './routes/ticket.routes';
import staffRoutes from './routes/staff.routes';
import statsRoutes from './routes/stats.routes';
import ticketPortalRoutes from './routes/ticket-portal.routes';
import ticketTemplateRoutes from './routes/ticket-template.routes';
import paymentRoutes from './routes/payment.routes';
import platformRoutes from './routes/platform.routes';
import templateRoutes from './routes/template.routes';
import storeRoutes from './routes/store.routes';
import publicStoreRoutes from './routes/public-store.routes';
import publicPortalRoutes from './routes/public-portal.routes';
import supportRoutes from './routes/support.routes';
import moduleRoutes from './routes/module.routes';

// 🚀 Community OS: Inicialização de Motores de Eventos e Drivers
import { automationEngine } from './services/automation-engine';
import { discordDriver } from './services/drivers/discord.driver';
import { communityWSServer } from './services/ws-server';
import { WebhookController } from './controllers/webhook.controller';

console.log('[CORE API] Community OS Engines: EventBus, AutomationEngine e Driver Layer inicializados.');

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ─────────────────────────────────────────────────────────────────────
// IMPORTANTE: garanta que o .env tenha ALLOWED_ORIGINS com orbitup.io
// Exemplo:
// ALLOWED_ORIGINS=https://orbitup.io,https://www.orbitup.io,http://localhost:3000,http://localhost:3001
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'https://orbitup.io,https://www.orbitup.io,http://localhost:3000,http://localhost:3001'
)
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-service-key'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Cookies (para ler orbitos_token vindo do navegador)
app.use(cookieParser());

// Stripe precisa do body "raw" ANTES do express.json()
app.use('/webhook/stripe', express.raw({ type: 'application/json' }), WebhookController.handleStripe);

// Demais rotas usam JSON
app.use(express.json());

// ── Mounting REST Routes ─────────────────────────────────
app.use('/auth', authRoutes);
app.use('/organizations', orgRoutes);
app.use('/organizations', moduleRoutes);
app.use('/servers', serverRoutes);
app.use('/internal', internalRoutes); // Bot Engine only (x-internal-service-key)
app.use('/tickets', ticketRoutes);
app.use('/staff', staffRoutes);
app.use('/stats', statsRoutes);
app.use('/ticket-portals', ticketPortalRoutes);
app.use('/ticket-templates', ticketTemplateRoutes);
app.use('/payments', paymentRoutes);
app.use('/platform', platformRoutes);
app.use('/templates', templateRoutes);
app.use('/store', storeRoutes);
app.use('/public/store', publicStoreRoutes);
app.use('/public/portal', publicPortalRoutes);
app.use('/support', supportRoutes);

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
      connectedClients: communityWSServer.getConnectedCount(),
      connectedAgents: communityWSServer.getConnectedAgents(),
    },
  });
});

// 🛰️ Agent Status — Lista os Orbit Agents conectados
app.get('/agents/status', (req, res) => {
  const agents = communityWSServer.getConnectedAgents();
  res.json({
    online: agents.length > 0,
    count: agents.length,
    agents,
    ts: new Date().toISOString(),
  });
});

// Middleware de Erros Globais
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// ── HTTP + WebSocket Server ──────────────────────────────
const server = http.createServer(app);
communityWSServer.init(server);

server.listen(PORT, () => {
  console.log(`[CORE API] 🚀 Servidor rodando na porta ${PORT}`);
});