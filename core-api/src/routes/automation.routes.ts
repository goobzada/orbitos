import { Router } from 'express';
import { automationController } from '../controllers/automation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOrgAccess } from '../middlewares/org-access.middleware';

const router = Router();

// Metadados globais (não precisam de org específica)
router.get('/triggers', authMiddleware, automationController.getAvailableTriggers);
router.get('/actions', authMiddleware, automationController.getAvailableActions);

// Rotas por organização — todas protegidas
router.use('/:organizationId', authMiddleware, requireOrgAccess);

router.get('/:organizationId', automationController.list);
router.post('/:organizationId', automationController.create);
router.get('/:organizationId/:id', automationController.getById);
router.put('/:organizationId/:id', automationController.update);
router.delete('/:organizationId/:id', automationController.deleteOne);
router.patch('/:organizationId/:id/toggle', automationController.toggle);
router.get('/:organizationId/:id/logs', automationController.getLogs);
router.post('/:organizationId/:id/test', automationController.testFire);

export default router;
