"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const router = (0, express_1.Router)();
// /public/store/:slug
router.get('/resolve', store_controller_1.StoreController.resolveStoreByHost);
// Usado pelo Caddy on-demand TLS para verificar se o domínio está cadastrado
router.get('/domain/verify', store_controller_1.StoreController.verifyDomainForCaddy);
router.get('/:slug/products', store_controller_1.StoreController.getPublicProducts);
router.post('/:slug/checkout', store_controller_1.StoreController.checkoutPublic);
exports.default = router;
