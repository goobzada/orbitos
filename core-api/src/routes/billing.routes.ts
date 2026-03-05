import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOrgAccess } from '../middlewares/org-access.middleware';

const router = Router();

// Todas as rotas de faturamento requerem login e acesso à organização
router.use('/:organizationId', authMiddleware, requireOrgAccess);

// Status e Faturas
router.get('/:organizationId/status', billingController.getBillingStatus);

// Criar Sessão de Checkout
router.post('/:organizationId/upgrade', billingController.createCheckoutSession);

export default router;
