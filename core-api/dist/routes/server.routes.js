"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_controller_1 = require("../controllers/server.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const org_access_middleware_1 = require("../middlewares/org-access.middleware");
const org_resolvers_1 = require("../middlewares/org-resolvers");
const serverRoutes = (0, express_1.Router)();
const serverController = new server_controller_1.ServerController();
// Aplica autenticação para o módulo inteiro de Servidores
serverRoutes.use(auth_middleware_1.authMiddleware);
serverRoutes.get('/', serverController.getServers);
serverRoutes.post('/', org_access_middleware_1.requireOrgAccess, serverController.createServer);
serverRoutes.delete('/:id', org_resolvers_1.resolveOrgFromServer, org_access_middleware_1.requireOrgAccess, serverController.deleteServer);
serverRoutes.patch('/:id/config', org_resolvers_1.resolveOrgFromServer, org_access_middleware_1.requireOrgAccess, serverController.updateConfig);
exports.default = serverRoutes;
