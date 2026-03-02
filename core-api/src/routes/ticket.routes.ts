import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOrgAccess } from '../middlewares/org-access.middleware';
import { resolveOrgFromTicket } from '../middlewares/org-resolvers';

const ticketRoutes = Router();
const ticketCtrl = new TicketController();

// Verifica JWT antes de acessar
ticketRoutes.use(authMiddleware);

// Permite listar tickets das orgs do usuário
ticketRoutes.get('/', ticketCtrl.listMyTickets);

// Protege tickets específicos via resolvers e role-check
ticketRoutes.get('/:id', resolveOrgFromTicket, requireOrgAccess, ticketCtrl.getTicket);
ticketRoutes.post('/:id/messages', resolveOrgFromTicket, requireOrgAccess, ticketCtrl.sendTicketMessage);
ticketRoutes.patch('/:id/close', resolveOrgFromTicket, requireOrgAccess, ticketCtrl.closeTicket);
ticketRoutes.patch('/:id/status', resolveOrgFromTicket, requireOrgAccess, ticketCtrl.updateTicketStatus);
ticketRoutes.patch('/:id/priority', resolveOrgFromTicket, requireOrgAccess, ticketCtrl.updateTicketPriority);
ticketRoutes.patch('/:id/assign', resolveOrgFromTicket, requireOrgAccess, ticketCtrl.assignTicketStaff);
ticketRoutes.delete('/:id', resolveOrgFromTicket, requireOrgAccess, ticketCtrl.deleteTicket);

export default ticketRoutes;
