import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireOrgAccess } from '../middlewares/org-access.middleware';
import { TemplateService } from '../services/domain/template.service';

const templateRoutes = Router();
const templateService = new TemplateService();

/**
 * GET /templates/presets
 * Lista presets disponíveis com indicação de lock por plano da org informada.
 * Query: ?organizationId=xxx
 */
templateRoutes.get('/presets', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.query;

        // Busca o plano da org — fallback FREE se não informada
        let plan = 'FREE';
        if (organizationId) {
            const { default: prisma } = await import('../lib/prisma');
            const org = await prisma.organization.findUnique({
                where: { id: organizationId as string },
                select: { plan: true }
            });
            plan = org?.plan ?? 'FREE';
        }

        const presets = await templateService.getPresetsForPlan(plan);
        res.json(presets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar presets.' });
    }
});

/**
 * GET /templates/identity/:organizationId
 * Retorna identidade visual completa da organização (preset + tokens de estilo)
 */
templateRoutes.get('/identity/:organizationId', authMiddleware, requireOrgAccess, async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.organizationId as string;
        const identity = await templateService.getIdentity(organizationId);

        if (!identity) {
            return res.status(404).json({ error: 'Organização não encontrada.' });
        }

        res.json(identity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar identidade.' });
    }
});

/**
 * PUT /templates/identity/:organizationId
 * Salva configuração de identidade visual. Gate de plano aplicado aqui.
 */
templateRoutes.put('/identity/:organizationId', authMiddleware, requireOrgAccess, async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.organizationId as string;
        const data = req.body;
        const userId = req.user?.id;

        const result = await templateService.updateIdentity(organizationId, userId!, data);
        res.json(result);
    } catch (error: any) {
        // Retorna erro claro para o frontend exibir o modal de upgrade
        if (error.message?.startsWith('PLAN_UPGRADE_REQUIRED:')) {
            const requiredPlan = error.message.split(':')[1];
            return res.status(403).json({ error: 'Upgrade necessário.', requiredPlan });
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar identidade.' });
    }
});

export default templateRoutes;
