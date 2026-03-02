import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', authController.mockDiscordLogin);
authRoutes.post('/oauth-login', authController.oauthLogin);
authRoutes.post('/discord/callback', authController.discordCallback);
authRoutes.get('/me', authMiddleware, authController.me);

export default authRoutes;
