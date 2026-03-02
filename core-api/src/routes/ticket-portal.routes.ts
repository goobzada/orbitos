import { Router } from 'express';
import { TicketPortalController } from '../controllers/ticket-portal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const ticketPortalRoutes = Router();
const portalCtrl = new TicketPortalController();

ticketPortalRoutes.use(authMiddleware);

ticketPortalRoutes.get('/', portalCtrl.listPortals);
ticketPortalRoutes.post('/', portalCtrl.createPortal);
ticketPortalRoutes.put('/:id', portalCtrl.updatePortal);
ticketPortalRoutes.delete('/:id', portalCtrl.deletePortal);

export default ticketPortalRoutes;
