"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleService = exports.ModuleService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class ModuleService {
    async listModules() {
        return prisma_1.default.module.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' }
        });
    }
    async getTenantModules(organizationId) {
        return prisma_1.default.organizationModule.findMany({
            where: { organizationId },
            include: { module: true }
        });
    }
    async toggleModule(organizationId, moduleKey, active) {
        const module = await prisma_1.default.module.findUnique({
            where: { key: moduleKey }
        });
        if (!module)
            throw new Error('Módulo não encontrado.');
        const org = await prisma_1.default.organization.findUnique({
            where: { id: organizationId },
            select: { communityType: true }
        });
        const existing = await prisma_1.default.organizationModule.findUnique({
            where: {
                organizationId_moduleId: {
                    organizationId,
                    moduleId: module.id
                }
            }
        });
        let config = existing?.config || {};
        // Se for a primeira vez ativando (config vazia e ativando), tenta aplicar preset
        if (active && (!existing || Object.keys(config).length === 0)) {
            const orgType = org?.communityType || 'general';
            // Tenta o tipo da org
            let preset = await prisma_1.default.modulePreset.findUnique({
                where: {
                    moduleId_communityType: {
                        moduleId: module.id,
                        communityType: orgType
                    }
                }
            });
            // Fallback para general se não encontrou o específico
            if (!preset && orgType !== 'general') {
                preset = await prisma_1.default.modulePreset.findUnique({
                    where: {
                        moduleId_communityType: {
                            moduleId: module.id,
                            communityType: 'general'
                        }
                    }
                });
            }
            if (preset) {
                config = preset.presetConfig;
            }
        }
        return prisma_1.default.organizationModule.upsert({
            where: {
                organizationId_moduleId: {
                    organizationId,
                    moduleId: module.id
                }
            },
            update: { isActive: active, config: config },
            create: {
                organizationId,
                moduleId: module.id,
                isActive: active,
                config: config
            }
        });
    }
    async resetToPreset(organizationId, moduleKey) {
        const module = await prisma_1.default.module.findUnique({
            where: { key: moduleKey }
        });
        if (!module)
            throw new Error('Módulo não encontrado.');
        const org = await prisma_1.default.organization.findUnique({
            where: { id: organizationId },
            select: { communityType: true }
        });
        const orgType = org?.communityType || 'general';
        let preset = await prisma_1.default.modulePreset.findUnique({
            where: {
                moduleId_communityType: {
                    moduleId: module.id,
                    communityType: orgType
                }
            }
        });
        // Fallback para 'general' se não encontrou o específico
        if (!preset && orgType !== 'general') {
            preset = await prisma_1.default.modulePreset.findUnique({
                where: {
                    moduleId_communityType: {
                        moduleId: module.id,
                        communityType: 'general'
                    }
                }
            });
        }
        if (!preset)
            throw new Error('Este módulo ainda não possui predefinições configuradas.');
        return prisma_1.default.organizationModule.upsert({
            where: {
                organizationId_moduleId: {
                    organizationId,
                    moduleId: module.id
                }
            },
            update: { config: preset.presetConfig },
            create: {
                organizationId,
                moduleId: module.id,
                isActive: true,
                config: preset.presetConfig
            }
        });
    }
    async updateModuleConfig(organizationId, moduleKey, config) {
        const module = await prisma_1.default.module.findUnique({
            where: { key: moduleKey }
        });
        if (!module)
            throw new Error('Módulo não encontrado.');
        return prisma_1.default.organizationModule.update({
            where: {
                organizationId_moduleId: {
                    organizationId,
                    moduleId: module.id
                }
            },
            data: { config }
        });
    }
}
exports.ModuleService = ModuleService;
exports.moduleService = new ModuleService();
