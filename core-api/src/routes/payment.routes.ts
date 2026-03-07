import { Router } from 'express';

const router = Router();

// Stripe webhook is handled by WebhookController at /webhook/stripe (with idempotency checks).
// No additional payment routes currently.

export default router;
