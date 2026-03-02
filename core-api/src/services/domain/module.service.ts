import prisma from '../../lib/prisma';

export class ModuleService {
    async listModules() {
        return prisma.module.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' }
        });
    }

    async getTenantModules(organizationId: string) {
        return prisma.organizationModule.findMany({
            where: { organizationId },
            include: { module: true }
        });
    }

    async toggleModule(organizationId: string, moduleKey: string, active: boolean) {
        const module = await prisma.module.findUnique({
            where: { key: moduleKey }
        });

        if (!module) throw new Error('Módulo não encontrado.');

        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { communityType: true }
        });

        const existing = await prisma.organizationModule.findUnique({
            where: {
                organizationId_moduleId: {
                    organizationId,
                    moduleId: module.id
                }
            }
        });

        let config = existing?.config || {};

        // Se for a primeira vez ativando (config vazia e ativando), tenta aplicar preset
        if (active && (!existing || Object.keys(config as any).length === 0)) {
            const orgType = org?.communityType || 'general';

            // Tenta o tipo da org
            let preset = await prisma.modulePreset.findUnique({
                where: {
                    moduleId_communityType: {
                        moduleId: module.id,
                        communityType: orgType
                    }
                }
            });

            // Fallback para general se não encontrou o específico
            if (!preset && orgType !== 'general') {
                preset = await prisma.modulePreset.findUnique({
                    where: {
                        moduleId_communityType: {
                            moduleId: module.id,
                            communityType: 'general'
                        }
                    }
                });
            }

            if (preset) {
                config = preset.presetConfig as any;
            }
        }

        return prisma.organizationModule.upsert({
            where: {
                organizationId_moduleId: {
                    organizationId,
                    moduleId: module.id
                }
            },
            update: { isActive: active, config: config as any },
            create: {
                organizationId,
                moduleId: module.id,
                isActive: active,
                config: config as any
            }
        });
    }

    async resetToPreset(organizationId: string, moduleKey: string) {
        const module = await prisma.module.findUnique({
            where: { key: moduleKey }
        });

        if (!module) throw new Error('Módulo não encontrado.');

        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { communityType: true }
        });

        const orgType = org?.communityType || 'general';

        let preset = await prisma.modulePreset.findUnique({
            where: {
                moduleId_communityType: {
                    moduleId: module.id,
                    communityType: orgType
                }
            }
        });

        // Fallback para 'general' se não encontrou o específico
        if (!preset && orgType !== 'general') {
            preset = await prisma.modulePreset.findUnique({
                where: {
                    moduleId_communityType: {
                        moduleId: module.id,
                        communityType: 'general'
                    }
                }
            });
        }

        if (!preset) throw new Error('Este módulo ainda não possui predefinições configuradas.');

        return prisma.organizationModule.upsert({
            where: {
                organizationId_moduleId: {
                    organizationId,
                    moduleId: module.id
                }
            },
            update: { config: preset.presetConfig as any },
            create: {
                organizationId,
                moduleId: module.id,
                isActive: true,
                config: preset.presetConfig as any
            }
        });
    }

    async updateModuleConfig(organizationId: string, moduleKey: string, config: any) {
        const module = await prisma.module.findUnique({
            where: { key: moduleKey }
        });

        if (!module) throw new Error('Módulo não encontrado.');

        return prisma.organizationModule.update({
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

export const moduleService = new ModuleService();
