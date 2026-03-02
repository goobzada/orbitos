"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const org_controller_1 = require("../controllers/org.controller");
const router = (0, express_1.Router)();
const orgController = new org_controller_1.OrgController();
// GET /public/portal/:slug
router.get('/:slug', orgController.getPublicPortalData);
exports.default = router;
