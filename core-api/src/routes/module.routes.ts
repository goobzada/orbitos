import { Router } from 'express';
import { moduleController } from '../controllers/module.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOrgAccess } from '../middlewares/org-access.middleware';

const router = Router();

// /organizations/:organizationId/modules
router.get('/:organizationId/modules', authMiddleware, requireOrgAccess, moduleController.listModules.bind(moduleController));
router.post('/:organizationId/modules/toggle', authMiddleware, requireOrgAccess, moduleController.toggleModule.bind(moduleController));
router.post('/:organizationId/modules/config', authMiddleware, requireOrgAccess, moduleController.updateConfig.bind(moduleController));
router.post('/:organizationId/modules/reset-config', authMiddleware, requireOrgAccess, moduleController.resetConfig.bind(moduleController));

export default router;
