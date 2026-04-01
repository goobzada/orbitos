"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Stripe webhook is handled by WebhookController at /webhook/stripe (with idempotency checks).
// No additional payment routes currently.
exports.default = router;
