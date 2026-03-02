"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const org_controller_1 = require("../controllers/org.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const orgRoutes = (0, express_1.Router)();
const orgController = new org_controller_1.OrgController();
// ─── Organizations Management ──────────────────────────────
// Listar organizações do usuário logado
orgRoutes.get('/me', auth_middleware_1.authMiddleware, orgController.getMyOrganizations);
// Criar nova organização
orgRoutes.post('/', auth_middleware_1.authMiddleware, orgController.createOrganization);
// Atualizar organização (White-Label: slug, subdomain, etc)
orgRoutes.patch('/:organizationId', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, orgController.updateOrganization);
// ─── Analytics & Tickets ───────────────────────────────────
// Analytics detalhado de uma Org específica
orgRoutes.get('/:organizationId/analytics', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, orgController.getAnalytics);
// Templates de Ticket
orgRoutes.get('/:organizationId/tickets/templates', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, orgController.getTicketTemplates);
orgRoutes.post('/:organizationId/tickets/templates', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, orgController.createTicketTemplate);
orgRoutes.delete('/:organizationId/tickets/templates/:templateId', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess, orgController.deleteTicketTemplate);
exports.default = orgRoutes;
