"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const support_controller_1 = require("../controllers/support.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const supportRoutes = (0, express_1.Router)();
const supportController = new support_controller_1.SupportController();
// ─── LADO TENANT_OWNER (DONO DA LOJA) ────────────────────────────────────────────────────────
// 🔐 Gerar Novo PIN (Tempo de 15 min e Max Uso = 1)
supportRoutes.post('/orgs/:organizationId/pin', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, supportController.generatePin);
// 📋 Ver Sessões de Suporte / PINs Criados Ativos ou Histórico
supportRoutes.get('/orgs/:organizationId/sessions', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, supportController.getActiveSessions);
// 🛑 Revocar Permissão ou Encerrar Sessão Ativa
supportRoutes.delete('/orgs/:organizationId/sessions/:sessionId', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, supportController.revokeSession);
// ─── LADO ORBITOS SUPPORT (AGENTE OU SUPER_ADMIN) ──────────────────────────────────────────
// 🔑 Entrar na Conta Usando o PIN de autorização
// Pode expandir requireRole permitindo 'SUPPORT_AGENT' futuramente dependendo do array do cargo
supportRoutes.post('/use-pin', auth_middleware_1.authMiddleware, (0, role_middleware_1.requireRole)('SUPER_ADMIN', 'SUPPORT_AGENT'), supportController.usePin);
exports.default = supportRoutes;
