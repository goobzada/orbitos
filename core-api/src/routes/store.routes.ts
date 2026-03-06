import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authMiddleware, requireOrgAccess } from '../middlewares/auth.middleware';
import { checkPlanLimit } from '../middlewares/plan-limit.middleware';

const router = Router();

// Middleware base: Todas as rotas /store/* requerem auth e orgAccess (exceto se a gente quisesse uma liberação global, mas aqui a gente vai focar em /organizations/:organizationId/store ou passar o orgId no body/params).
// Vamos organizar para que o /store receba organizationId nos params:
// ex: GET /store/:organizationId/settings

router.use('/:organizationId', authMiddleware, requireOrgAccess);

// --- SETTINGS ---
router.get('/:organizationId/settings', StoreController.getSettings);
router.put('/:organizationId/settings', StoreController.updateSettings);

// --- PRODUCTS ---
router.get('/:organizationId/products', StoreController.listProducts);
router.post('/:organizationId/products', checkPlanLimit('maxProducts'), StoreController.createProduct);
router.put('/:organizationId/products/:id', StoreController.updateProduct);
router.delete('/:organizationId/products/:id', StoreController.deleteProduct);

// --- ORDERS ---
router.get('/:organizationId/orders', StoreController.listOrders);
router.put('/:organizationId/orders/:id/deliver', StoreController.deliverOrder);

// --- DOMAINS ---
router.get('/:organizationId/domains', StoreController.listDomains);
router.post('/:organizationId/domains', StoreController.addDomain);
router.post('/:organizationId/domains/:domainId/verify', StoreController.verifyDomain);
router.post('/:organizationId/domains/:domainId/set-primary', StoreController.setPrimaryDomain);
router.delete('/:organizationId/domains/:domainId', StoreController.deleteDomain);

export default router;
