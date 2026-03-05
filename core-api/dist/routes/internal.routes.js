"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const internal_controller_1 = require("../controllers/internal.controller");
const internal_allowlist_controller_1 = require("../controllers/internal-allowlist.controller");
const internal_giveaway_controller_1 = require("../controllers/internal-giveaway.controller");
const internal_application_controller_1 = require("../controllers/internal-application.controller");
const internal_middleware_1 = require("../middlewares/internal.middleware");
const plan_limit_middleware_1 = require("../middlewares/plan-limit.middleware");
const internalRoutes = (0, express_1.Router)();
const ctrl = new internal_controller_1.InternalController();
const allowlistCtrl = new internal_allowlist_controller_1.InternalAllowlistController();
const giveawayCtrl = new internal_giveaway_controller_1.InternalGiveawayController();
const appCtrl = new internal_application_controller_1.InternalApplicationController();
// Todas as rotas aqui exigem a Service Key do Bot (x-internal-service-key header)
internalRoutes.use(internal_middleware_1.internalMiddleware);
// Guilds
internalRoutes.post('/guilds', ctrl.syncGuild);
internalRoutes.get('/guilds/:guildId/modules', ctrl.getGuildModules.bind(ctrl));
internalRoutes.patch('/guilds/:guildId/disconnect', ctrl.disconnectGuild);
// Tickets
internalRoutes.post('/tickets', (0, plan_limit_middleware_1.checkPlanLimit)('maxTickets'), ctrl.createTicket);
internalRoutes.post('/tickets/messages', ctrl.receiveTicketMessage);
internalRoutes.patch('/tickets/:id/close', ctrl.closeTicket);
// Moderação
internalRoutes.post('/moderation/warn', ctrl.logModeration);
internalRoutes.post('/moderation/mute', ctrl.logModeration);
internalRoutes.post('/moderation/kick', ctrl.logModeration);
internalRoutes.post('/moderation/ban', ctrl.logModeration);
// Membros
internalRoutes.post('/members/join', ctrl.memberJoin);
// Sorteios (Giveaways)
internalRoutes.get('/giveaways/active', giveawayCtrl.listActiveGiveaways);
internalRoutes.post('/giveaways', (0, plan_limit_middleware_1.checkPlanLimit)('maxGiveaways'), giveawayCtrl.createGiveaway);
internalRoutes.post('/giveaways/join', giveawayCtrl.joinGiveaway);
internalRoutes.patch('/giveaways/:id/end', giveawayCtrl.endGiveaway);
// Formulários (Applications)
internalRoutes.get('/applications/:guildId', appCtrl.getActiveForms);
internalRoutes.post('/applications/submit', appCtrl.submitApplication);
// Observabilidade
internalRoutes.post('/heartbeat', ctrl.heartbeat);
// Orbit Agent Supervisor — lista todos os servidores ativos
internalRoutes.get('/servers', ctrl.listServers.bind(ctrl));
// Rotas do Módulo Allowlist V2
internalRoutes.get('/allowlist/active-form', allowlistCtrl.getActiveForm);
internalRoutes.post('/allowlist/forms/:id/submit', allowlistCtrl.submitForm);
// Loja
internalRoutes.get('/store/products/:guildId', ctrl.getStoreProducts.bind(ctrl));
exports.default = internalRoutes;
