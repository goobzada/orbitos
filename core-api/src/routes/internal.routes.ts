import { Router } from 'express';
import { InternalController } from '../controllers/internal.controller';
import { InternalAllowlistController } from '../controllers/internal-allowlist.controller';
import { InternalGiveawayController } from '../controllers/internal-giveaway.controller';
import { InternalApplicationController } from '../controllers/internal-application.controller';
import { internalMiddleware } from '../middlewares/internal.middleware';

const internalRoutes = Router();
const ctrl = new InternalController();
const allowlistCtrl = new InternalAllowlistController();
const giveawayCtrl = new InternalGiveawayController();
const appCtrl = new InternalApplicationController();

// Todas as rotas aqui exigem a Service Key do Bot (x-internal-service-key header)
internalRoutes.use(internalMiddleware);

// Guilds
internalRoutes.post('/guilds', ctrl.syncGuild);
internalRoutes.get('/guilds/:guildId/modules', ctrl.getGuildModules.bind(ctrl));
internalRoutes.patch('/guilds/:guildId/disconnect', ctrl.disconnectGuild);

// Tickets
internalRoutes.post('/tickets', ctrl.createTicket);
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
internalRoutes.post('/giveaways', giveawayCtrl.createGiveaway);
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

export default internalRoutes;
