"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleController = exports.ModuleController = void 0;
const module_service_1 = require("../services/domain/module.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
class ModuleController {
    async listModules(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const allModules = await module_service_1.moduleService.listModules();
            const tenantModules = await module_service_1.moduleService.getTenantModules(organizationId);
            // Fetch the organization to get its communityType for recommendations
            const org = await prisma_1.default.organization.findUnique({
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
        }
        catch (error) {
            console.error('[MODULE] List error:', error);
            return res.status(500).json({ error: 'Erro ao listar módulos.' });
        }
    }
    async toggleModule(req, res) {
        const organizationId = req.params.organizationId;
        const { moduleKey, active } = req.body;
        try {
            const updated = await module_service_1.moduleService.toggleModule(organizationId, moduleKey, active);
            return res.json(updated);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async updateConfig(req, res) {
        const organizationId = req.params.organizationId;
        const { moduleKey, config } = req.body;
        try {
            const updated = await module_service_1.moduleService.updateModuleConfig(organizationId, moduleKey, config);
            return res.json(updated);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    async resetConfig(req, res) {
        const organizationId = req.params.organizationId;
        const { moduleKey } = req.body;
        try {
            const updated = await module_service_1.moduleService.resetToPreset(organizationId, moduleKey);
            return res.json(updated);
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}
exports.ModuleController = ModuleController;
exports.moduleController = new ModuleController();
