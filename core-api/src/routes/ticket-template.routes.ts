import { Router } from 'express';
import { TicketTemplateController } from '../controllers/ticket-template.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const ticketTemplateRoutes = Router();
const templateCtrl = new TicketTemplateController();

ticketTemplateRoutes.use(authMiddleware);

ticketTemplateRoutes.get('/', templateCtrl.listTemplates);
ticketTemplateRoutes.post('/', templateCtrl.createTemplate);
ticketTemplateRoutes.put('/:id', templateCtrl.updateTemplate);

export default ticketTemplateRoutes;
