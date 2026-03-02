import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { authMiddleware, requireOrgAccess } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const supportRoutes = Router();
const supportController = new SupportController();

// ─── LADO TENANT_OWNER (DONO DA LOJA) ────────────────────────────────────────────────────────

// 🔐 Gerar Novo PIN (Tempo de 15 min e Max Uso = 1)
supportRoutes.post('/orgs/:organizationId/pin', authMiddleware, requireOrgAccess, supportController.generatePin);

// 📋 Ver Sessões de Suporte / PINs Criados Ativos ou Histórico
supportRoutes.get('/orgs/:organizationId/sessions', authMiddleware, requireOrgAccess, supportController.getActiveSessions);

// 🛑 Revocar Permissão ou Encerrar Sessão Ativa
supportRoutes.delete('/orgs/:organizationId/sessions/:sessionId', authMiddleware, requireOrgAccess, supportController.revokeSession);

// ─── LADO ORBITOS SUPPORT (AGENTE OU SUPER_ADMIN) ──────────────────────────────────────────

// 🔑 Entrar na Conta Usando o PIN de autorização
// Pode expandir requireRole permitindo 'SUPPORT_AGENT' futuramente dependendo do array do cargo
supportRoutes.post('/use-pin', authMiddleware, requireRole('SUPER_ADMIN', 'SUPPORT_AGENT'), supportController.usePin);

export default supportRoutes;
