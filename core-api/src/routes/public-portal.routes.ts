import { Router } from 'express';
import { OrgController } from '../controllers/org.controller';

const router = Router();
const orgController = new OrgController();

// GET /public/portal/:slug
router.get('/:slug', orgController.getPublicPortalData);

export default router;
