import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.get('/discord', authController.discordLogin);
authRoutes.get('/discord/callback', authController.discordCallback);
authRoutes.post('/login', authController.mockDiscordLogin);
authRoutes.post('/oauth-login', authController.oauthLogin);
authRoutes.post('/discord/callback', authController.discordCallback);
authRoutes.get('/me', authMiddleware, authController.me);
authRoutes.get('/logout', authController.logout);
authRoutes.post('/logout', authController.logout);

export default authRoutes;
