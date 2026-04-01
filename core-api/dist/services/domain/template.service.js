"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const PLAN_PRIORITY = { FREE: 0, PRO: 1, ENTERPRISE: 2, MAX: 3 };
class TemplateService {
    /** Lista os presets disponíveis para o plano da organização */
    async getPresetsForPlan(orgPlan) {
        const orgLevel = PLAN_PRIORITY[orgPlan] ?? 0;
        const presets = await prisma_1.default.templatePreset.findMany({
            where: { isActive: true }
        });
        // Retorna todos, mas marca os que estão bloqueados pelo plano
        return presets.map(preset => ({
            ...preset,
            locked: (PLAN_PRIORITY[preset.minPlan] ?? 0) > orgLevel
        }));
    }
    /** Busca a identidade atual de uma org (preset + tokens) */
    async getIdentity(organizationId) {
        const org = await prisma_1.default.organization.findUnique({
            where: { id: organizationId },
            include: { template: true }
        });
        if (!org)
            return null;
        const templateKey = org.template?.templateKey ?? 'default-classic';
        let preset = await prisma_1.default.templatePreset.findUnique({ where: { key: templateKey } });
        // Fallback estático quando o preset não está semeado na DB (evita layout errado no portal)
        if (!preset) {
            const PRESET_DEFAULTS = {
                'default-classic': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'rounded', fontPreset: 'default' },
                'neon-grid': { layoutType: 'dashboard-topnav', navigation: 'topnav', heroMode: 'small', backgroundPattern: 'grid-neon', cardShape: 'glass', fontPreset: 'modern' },
                'minimal-glass': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'none', backgroundPattern: 'none', cardShape: 'glass', fontPreset: 'minimal' },
                'terminal-dark': { layoutType: 'terminal', navigation: 'sidebar', heroMode: 'none', backgroundPattern: 'scanline', cardShape: 'square', fontPreset: 'mono' },
                'aurora-landing': { layoutType: 'marketing-landing', navigation: 'topnav', heroMode: 'full', backgroundPattern: 'aurora', cardShape: 'elevated', fontPreset: 'default' },
                'modular-blocks': { layoutType: 'blocks', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'block', fontPreset: 'default' },
                'cosmic-ultra': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'cosmos', cardShape: 'glass-intense', fontPreset: 'modern' },
                'obsidian-empire': { layoutType: 'obsidian-empire', navigation: 'none', heroMode: 'full', backgroundPattern: 'none', cardShape: 'square', fontPreset: 'luxury' },
                'hologram-pro': { layoutType: 'hologram-pro', navigation: 'topnav', heroMode: 'full', backgroundPattern: 'none', cardShape: 'square', fontPreset: 'mono' },
            };
            const fallbackConfig = PRESET_DEFAULTS[templateKey] || PRESET_DEFAULTS['default-classic'];
            preset = { key: templateKey, config: fallbackConfig };
        }
        // Retornamos um objeto achatado para o frontend, priorizando valores customizados (org.template)
        // e usando o preset como fallback.
        const config = preset?.config || {};
        const template = org.template;
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
    async updateIdentity(organizationId, userId, data) {
        const org = await prisma_1.default.organization.findUnique({ where: { id: organizationId } });
        if (!org)
            throw new Error('Organização não encontrada.');
        const { templateKey, presetKey, borderRadius, borderRadiusPx, letterSpacing, letterSpacingPx, ...rest } = data;
        const cleanData = {
            ...rest,
            templateKey: templateKey || presetKey,
            borderRadiusPx: borderRadiusPx || borderRadius,
            letterSpacing: letterSpacing || letterSpacingPx,
        };
        // Extrair campos de Hero para o HeroConfig se vierem soltos
        if (data.heroImageUrl || data.heroOpacity) {
            cleanData.heroConfig = {
                imageUrl: data.heroImageUrl,
                opacity: data.heroOpacity,
                position: data.heroPosition,
            };
        }
        // Validação de plano: se tentou trocar templateKey para PRO sendo FREE
        const activeTemplateKey = cleanData.templateKey;
        if (activeTemplateKey && activeTemplateKey !== 'default-classic') {
            const preset = await prisma_1.default.templatePreset.findUnique({ where: { key: activeTemplateKey } });
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
        const prismaData = {};
        const intFields = ['fontSizeBasePx', 'letterSpacing', 'borderRadiusPx', 'logoHeightPx'];
        const boolFields = ['darkModeDefault'];
        for (const key of validFields) {
            if (cleanData[key] !== undefined) {
                let value = cleanData[key];
                // Int Conversion
                if (intFields.includes(key) && value !== null && value !== '') {
                    value = parseInt(value, 10);
                    if (isNaN(value))
                        value = undefined;
                }
                // Boolean Conversion
                if (boolFields.includes(key)) {
                    if (typeof value === 'string') {
                        value = value === 'true';
                    }
                    else {
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
            const updated = await prisma_1.default.organizationTemplate.upsert({
                where: { organizationId },
                update: { ...prismaData, updatedAt: new Date() },
                create: { organizationId, ...prismaData }
            });
            // 📊 Audit Log
            const { auditService } = await Promise.resolve().then(() => __importStar(require('./audit.service')));
            await auditService.log({
                organizationId,
                userId,
                action: 'IDENTITY_UPDATED',
                resourceType: 'OrganizationTemplate',
                resourceId: updated.id,
                metadata: { templateKey: prismaData.templateKey || data.templateKey }
            });
            return updated;
        }
        catch (error) {
            console.error('[TEMPLATE SERVICE] PRISMA ERROR DETAILS:', error);
            throw error;
        }
    }
}
exports.TemplateService = TemplateService;
