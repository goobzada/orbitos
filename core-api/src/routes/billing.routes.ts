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
router.post('/:organizationId/checkout', billingController.createCheckoutSession);

// Criar Sessão do Portal do Cliente (Stripe Billing Portal)
router.post('/:organizationId/portal', billingController.createCustomerPortalSession);

// Cancelar Assinatura (ao final do período)
router.post('/:organizationId/cancel', billingController.cancelSubscription);

// Reativar Assinatura Cancelada
router.post('/:organizationId/reactivate', billingController.reactivateSubscription);

export default router;
