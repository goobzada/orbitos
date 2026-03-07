import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';

const router = Router();

// /public/store/:slug

router.get('/resolve', StoreController.resolveStoreByHost);
// Usado pelo Caddy on-demand TLS para verificar se o domínio está cadastrado
router.get('/domain/verify', StoreController.verifyDomainForCaddy);
router.get('/:slug/products', StoreController.getPublicProducts);
router.post('/:slug/checkout', StoreController.checkoutPublic);

export default router;
