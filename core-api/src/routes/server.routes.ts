import { Router } from 'express';
import { ServerController } from '../controllers/server.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOrgAccess } from '../middlewares/org-access.middleware';
import { resolveOrgFromServer } from '../middlewares/org-resolvers';

const serverRoutes = Router();
const serverController = new ServerController();

// Aplica autenticação para o módulo inteiro de Servidores
serverRoutes.use(authMiddleware);

serverRoutes.get('/', serverController.getServers);
serverRoutes.post('/', requireOrgAccess, serverController.createServer);
serverRoutes.delete('/:id', resolveOrgFromServer, requireOrgAccess, serverController.deleteServer);
serverRoutes.patch('/:id/config', resolveOrgFromServer, requireOrgAccess, serverController.updateConfig);

export default serverRoutes;
