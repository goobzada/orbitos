"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const plan_limit_middleware_1 = require("../middlewares/plan-limit.middleware");
const router = (0, express_1.Router)();
// Middleware base: Todas as rotas /store/* requerem auth e orgAccess (exceto se a gente quisesse uma liberação global, mas aqui a gente vai focar em /organizations/:organizationId/store ou passar o orgId no body/params).
// Vamos organizar para que o /store receba organizationId nos params:
// ex: GET /store/:organizationId/settings
router.use('/:organizationId', auth_middleware_1.authMiddleware, auth_middleware_1.requireOrgAccess);
// --- SETTINGS ---
router.get('/:organizationId/settings', store_controller_1.StoreController.getSettings);
router.put('/:organizationId/settings', store_controller_1.StoreController.updateSettings);
// --- PRODUCTS ---
router.get('/:organizationId/products', store_controller_1.StoreController.listProducts);
router.post('/:organizationId/products', (0, plan_limit_middleware_1.checkPlanLimit)('maxProducts'), store_controller_1.StoreController.createProduct);
router.put('/:organizationId/products/:id', store_controller_1.StoreController.updateProduct);
router.delete('/:organizationId/products/:id', store_controller_1.StoreController.deleteProduct);
// --- ORDERS ---
router.get('/:organizationId/orders', store_controller_1.StoreController.listOrders);
exports.default = router;
