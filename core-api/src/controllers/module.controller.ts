import { Request, Response } from 'express';
import { moduleService } from '../services/domain/module.service';
import prisma from '../lib/prisma';

export class ModuleController {
    async listModules(req: Request, res: Response) {
        try {
            const organizationId = req.params.organizationId as string;
            const allModules = await moduleService.listModules();
            const tenantModules = await moduleService.getTenantModules(organizationId);

            // Fetch the organization to get its communityType for recommendations
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { communityType: true, plan: true }
            });

            // Map tenant modules for easier lookup
            const activeMap = new Map();
            tenantModules.forEach(tm => {
                activeMap.set(tm.module.key, tm);
            });

            const result = allModules.map(m => {
                const tenantMod = activeMap.get(m.key);
                return {
                    ...m,
                    active: tenantMod ? tenantMod.isActive : false,
                    config: tenantMod ? tenantMod.config : null
                };
            });

            return res.json({
                modules: result,
                communityType: org?.communityType || 'general',
                plan: org?.plan || 'FREE'
            });
        } catch (error) {
            console.error('[MODULE] List error:', error);
            return res.status(500).json({ error: 'Erro ao listar módulos.' });
        }
    }

    async toggleModule(req: Request, res: Response) {
        const organizationId = req.params.organizationId as string;
        const { moduleKey, active } = req.body;

        try {
            const updated = await moduleService.toggleModule(organizationId, moduleKey, active);
            return res.json(updated);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async updateConfig(req: Request, res: Response) {
        const organizationId = req.params.organizationId as string;
        const { moduleKey, config } = req.body;

        try {
            const updated = await moduleService.updateModuleConfig(organizationId, moduleKey, config);
            return res.json(updated);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async resetConfig(req: Request, res: Response) {
        const organizationId = req.params.organizationId as string;
        const { moduleKey } = req.body;

        try {
            const updated = await moduleService.resetToPreset(organizationId, moduleKey);
            return res.json(updated);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export const moduleController = new ModuleController();
