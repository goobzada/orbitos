import prisma from '../../lib/prisma';

interface IdentityUpdateData {
    templateKey?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    navBackground?: string;
    navTextColor?: string;
    cardBackground?: string;
    borderColor?: string;
    buttonTextColor?: string;
    textColor?: string;
    heroTextColor?: string;
    fontFamily?: string;
    fontSizeBasePx?: number;
    fontWeight?: string;
    letterSpacing?: number;
    borderRadiusPx?: number;
    darkModeDefault?: boolean;
    logoUrl?: string;
    logoHeightPx?: number;
    menuConfig?: any;
    heroConfig?: any;
    customCss?: string;
}

const PLAN_PRIORITY: Record<string, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2, MAX: 3 };

export class TemplateService {

    /** Lista os presets disponíveis para o plano da organização */
    async getPresetsForPlan(orgPlan: string) {
        const orgLevel = PLAN_PRIORITY[orgPlan] ?? 0;

        const presets = await prisma.templatePreset.findMany({
            where: { isActive: true }
        });

        // Retorna todos, mas marca os que estão bloqueados pelo plano
        return presets.map(preset => ({
            ...preset,
            locked: (PLAN_PRIORITY[preset.minPlan] ?? 0) > orgLevel
        }));
    }

    /** Busca a identidade atual de uma org (preset + tokens) */
    async getIdentity(organizationId: string) {
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            include: { template: true }
        });

        if (!org) return null;

        const templateKey = org.template?.templateKey ?? 'default-classic';
        let preset = await prisma.templatePreset.findUnique({ where: { key: templateKey } });

        // Fallback estático quando o preset não está semeado na DB (evita layout errado no portal)
        if (!preset) {
            const PRESET_DEFAULTS: Record<string, any> = {
                'default-classic': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'rounded', fontPreset: 'default' },
                'neon-grid':       { layoutType: 'dashboard-topnav',  navigation: 'topnav',  heroMode: 'small', backgroundPattern: 'grid-neon', cardShape: 'glass', fontPreset: 'modern' },
                'minimal-glass':   { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'none',  backgroundPattern: 'none', cardShape: 'glass', fontPreset: 'minimal' },
                'terminal-dark':   { layoutType: 'terminal',          navigation: 'sidebar', heroMode: 'none',  backgroundPattern: 'scanline', cardShape: 'square', fontPreset: 'mono' },
                'aurora-landing':  { layoutType: 'marketing-landing', navigation: 'topnav',  heroMode: 'full',  backgroundPattern: 'aurora', cardShape: 'elevated', fontPreset: 'default' },
                'modular-blocks':  { layoutType: 'blocks',            navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'block', fontPreset: 'default' },
                'cosmic-ultra':    { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'cosmos', cardShape: 'glass-intense', fontPreset: 'modern' },
                'obsidian-empire': { layoutType: 'obsidian-empire',   navigation: 'none',    heroMode: 'full',  backgroundPattern: 'none', cardShape: 'square', fontPreset: 'luxury' },
                'hologram-pro':    { layoutType: 'hologram-pro',      navigation: 'topnav',  heroMode: 'full',  backgroundPattern: 'none', cardShape: 'square', fontPreset: 'mono' },
            };
            const fallbackConfig = PRESET_DEFAULTS[templateKey] || PRESET_DEFAULTS['default-classic'];
            preset = { key: templateKey, config: fallbackConfig } as any;
        }

        // Retornamos um objeto achatado para o frontend, priorizando valores customizados (org.template)
        // e usando o preset como fallback.
        const config = (preset?.config as any) || {};
        const template = org.template as any;

        return {
            ...config,
            ...(template || {}),
            preset,
            identity: template,
            plan: org.plan,
            // Flatten Hero Config
            heroImageUrl: template?.heroConfig?.imageUrl || config.heroImageUrl,
            heroOpacity: template?.heroConfig?.opacity || config.heroOpacity,
            heroPosition: template?.heroConfig?.position || config.heroPosition,
            // Garantir que campos com nomes divergentes sejam mapeados corretamente para o frontend
            presetKey: template?.templateKey || preset?.key || 'default-classic',
            borderRadius: template?.borderRadiusPx ?? config.borderRadiusPx ?? 8,
            letterSpacingPx: template?.letterSpacing ?? config.letterSpacingPx ?? 0,
        };
    }

    /** Atualiza a identidade visual da organização. Valida plano antes de salvar. */
    async updateIdentity(organizationId: string, userId: string, data: IdentityUpdateData) {
        const org = await prisma.organization.findUnique({ where: { id: organizationId } });
        if (!org) throw new Error('Organização não encontrada.');

        const { templateKey, presetKey, borderRadius, borderRadiusPx, letterSpacing, letterSpacingPx, ...rest } = data as any;

        const cleanData: IdentityUpdateData = {
            ...rest,
            templateKey: templateKey || presetKey,
            borderRadiusPx: borderRadiusPx || borderRadius,
            letterSpacing: letterSpacing || letterSpacingPx,
        };

        // Extrair campos de Hero para o HeroConfig se vierem soltos
        if ((data as any).heroImageUrl || (data as any).heroOpacity) {
            cleanData.heroConfig = {
                imageUrl: (data as any).heroImageUrl,
                opacity: (data as any).heroOpacity,
                position: (data as any).heroPosition,
            };
        }

        // Validação de plano: se tentou trocar templateKey para PRO sendo FREE
        const activeTemplateKey = cleanData.templateKey;
        if (activeTemplateKey && activeTemplateKey !== 'default-classic') {
            const preset = await prisma.templatePreset.findUnique({ where: { key: activeTemplateKey } });
            if (preset) {
                const orgLevel = PLAN_PRIORITY[org.plan] ?? 0;
                const presetLevel = PLAN_PRIORITY[preset.minPlan] ?? 0;
                if (presetLevel > orgLevel) {
                    throw new Error(`PLAN_UPGRADE_REQUIRED:${preset.minPlan}`);
                }
            }
        }

        // Remover campos que não existem no modelo para evitar erro do Prisma
        const validFields = [
            'templateKey', 'primaryColor', 'secondaryColor', 'backgroundColor', 'surfaceColor',
            'navBackground', 'navTextColor', 'cardBackground', 'borderColor', 'buttonTextColor',
            'textColor', 'heroTextColor', 'fontFamily', 'fontSizeBasePx', 'fontWeight',
            'letterSpacing', 'borderRadiusPx', 'darkModeDefault', 'logoUrl', 'logoHeightPx',
            'menuConfig', 'heroConfig', 'customCss'
        ];

        const prismaData: any = {};
        const intFields = ['fontSizeBasePx', 'letterSpacing', 'borderRadiusPx', 'logoHeightPx'];
        const boolFields = ['darkModeDefault'];

        for (const key of validFields) {
            if ((cleanData as any)[key] !== undefined) {
                let value = (cleanData as any)[key];

                // Int Conversion
                if (intFields.includes(key) && value !== null && value !== '') {
                    value = parseInt(value, 10);
                    if (isNaN(value)) value = undefined;
                }

                // Boolean Conversion
                if (boolFields.includes(key)) {
                    if (typeof value === 'string') {
                        value = value === 'true';
                    } else {
                        value = !!value;
                    }
                }

                if (value !== undefined) {
                    prismaData[key] = value;
                }
            }
        }

        console.log('[TEMPLATE SERVICE] Attempting upsert with:', JSON.stringify(prismaData, null, 2));

        try {
            const updated = await prisma.organizationTemplate.upsert({
                where: { organizationId },
                update: { ...prismaData, updatedAt: new Date() },
                create: { organizationId, ...prismaData }
            });

            // 📊 Audit Log
            const { auditService } = await import('./audit.service');
            await auditService.log({
                organizationId,
                userId,
                action: 'IDENTITY_UPDATED',
                resourceType: 'OrganizationTemplate',
                resourceId: updated.id,
                metadata: { templateKey: prismaData.templateKey || data.templateKey }
            });

            return updated;
        } catch (error: any) {
            console.error('[TEMPLATE SERVICE] PRISMA ERROR DETAILS:', error);
            throw error;
        }


    }
}
