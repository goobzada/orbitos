import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

router.post('/webhook/stripe', paymentController.stripeWebhook);

export default router;
