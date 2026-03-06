import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';

const router = Router();

// /public/store/:slug

router.get('/resolve', StoreController.resolveStoreByHost);
router.get('/:slug/products', StoreController.getPublicProducts);
router.post('/:slug/checkout', StoreController.checkoutPublic);

export default router;
