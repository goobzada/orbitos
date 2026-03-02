import { Router } from 'express';
import { OrgController } from '../controllers/org.controller';
import { authMiddleware, requireOrgAccess } from '../middlewares/auth.middleware';

const orgRoutes = Router();
const orgController = new OrgController();

// ─── Organizations Management ──────────────────────────────
// Listar organizações do usuário logado
orgRoutes.get('/me', authMiddleware, orgController.getMyOrganizations);

// Criar nova organização
orgRoutes.post('/', authMiddleware, orgController.createOrganization);

// Atualizar organização (White-Label: slug, subdomain, etc)
orgRoutes.patch('/:organizationId', authMiddleware, requireOrgAccess, orgController.updateOrganization);

// ─── Analytics & Tickets ───────────────────────────────────
// Analytics detalhado de uma Org específica
orgRoutes.get('/:organizationId/analytics', authMiddleware, requireOrgAccess, orgController.getAnalytics);

// Templates de Ticket
orgRoutes.get('/:organizationId/tickets/templates', authMiddleware, requireOrgAccess, orgController.getTicketTemplates);
orgRoutes.post('/:organizationId/tickets/templates', authMiddleware, requireOrgAccess, orgController.createTicketTemplate);
orgRoutes.delete('/:organizationId/tickets/templates/:templateId', authMiddleware, requireOrgAccess, orgController.deleteTicketTemplate);

export default orgRoutes;
