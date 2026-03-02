import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const statsRoutes = Router();
const statsCtrl = new StatsController();

statsRoutes.use(authMiddleware);

statsRoutes.get('/overview', statsCtrl.getOverview);
statsRoutes.get('/audit/recent', statsCtrl.getRecentAudit);

export default statsRoutes;
