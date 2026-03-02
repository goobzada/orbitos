"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const module_controller_1 = require("../controllers/module.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const org_access_middleware_1 = require("../middlewares/org-access.middleware");
const router = (0, express_1.Router)();
// /organizations/:organizationId/modules
router.get('/:organizationId/modules', auth_middleware_1.authMiddleware, org_access_middleware_1.requireOrgAccess, module_controller_1.moduleController.listModules.bind(module_controller_1.moduleController));
router.post('/:organizationId/modules/toggle', auth_middleware_1.authMiddleware, org_access_middleware_1.requireOrgAccess, module_controller_1.moduleController.toggleModule.bind(module_controller_1.moduleController));
router.post('/:organizationId/modules/config', auth_middleware_1.authMiddleware, org_access_middleware_1.requireOrgAccess, module_controller_1.moduleController.updateConfig.bind(module_controller_1.moduleController));
router.post('/:organizationId/modules/reset-config', auth_middleware_1.authMiddleware, org_access_middleware_1.requireOrgAccess, module_controller_1.moduleController.resetConfig.bind(module_controller_1.moduleController));
exports.default = router;
