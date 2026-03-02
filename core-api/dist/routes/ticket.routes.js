"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const org_access_middleware_1 = require("../middlewares/org-access.middleware");
const org_resolvers_1 = require("../middlewares/org-resolvers");
const ticketRoutes = (0, express_1.Router)();
const ticketCtrl = new ticket_controller_1.TicketController();
// Verifica JWT antes de acessar
ticketRoutes.use(auth_middleware_1.authMiddleware);
// Permite listar tickets das orgs do usuário
ticketRoutes.get('/', ticketCtrl.listMyTickets);
// Protege tickets específicos via resolvers e role-check
ticketRoutes.get('/:id', org_resolvers_1.resolveOrgFromTicket, org_access_middleware_1.requireOrgAccess, ticketCtrl.getTicket);
ticketRoutes.post('/:id/messages', org_resolvers_1.resolveOrgFromTicket, org_access_middleware_1.requireOrgAccess, ticketCtrl.sendTicketMessage);
ticketRoutes.patch('/:id/close', org_resolvers_1.resolveOrgFromTicket, org_access_middleware_1.requireOrgAccess, ticketCtrl.closeTicket);
ticketRoutes.patch('/:id/status', org_resolvers_1.resolveOrgFromTicket, org_access_middleware_1.requireOrgAccess, ticketCtrl.updateTicketStatus);
ticketRoutes.patch('/:id/priority', org_resolvers_1.resolveOrgFromTicket, org_access_middleware_1.requireOrgAccess, ticketCtrl.updateTicketPriority);
ticketRoutes.patch('/:id/assign', org_resolvers_1.resolveOrgFromTicket, org_access_middleware_1.requireOrgAccess, ticketCtrl.assignTicketStaff);
ticketRoutes.delete('/:id', org_resolvers_1.resolveOrgFromTicket, org_access_middleware_1.requireOrgAccess, ticketCtrl.deleteTicket);
exports.default = ticketRoutes;
