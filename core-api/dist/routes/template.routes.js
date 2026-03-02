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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const org_access_middleware_1 = require("../middlewares/org-access.middleware");
const template_service_1 = require("../services/domain/template.service");
const templateRoutes = (0, express_1.Router)();
const templateService = new template_service_1.TemplateService();
/**
 * GET /templates/presets
 * Lista presets disponíveis com indicação de lock por plano da org informada.
 * Query: ?organizationId=xxx
 */
templateRoutes.get('/presets', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { organizationId } = req.query;
        // Busca o plano da org — fallback FREE se não informada
        let plan = 'FREE';
        if (organizationId) {
            const { default: prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { plan: true }
            });
            plan = org?.plan ?? 'FREE';
        }
        const presets = await templateService.getPresetsForPlan(plan);
        res.json(presets);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar presets.' });
    }
});
/**
 * GET /templates/identity/:organizationId
 * Retorna identidade visual completa da organização (preset + tokens de estilo)
 */
templateRoutes.get('/identity/:organizationId', auth_middleware_1.authMiddleware, org_access_middleware_1.requireOrgAccess, async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const identity = await templateService.getIdentity(organizationId);
        if (!identity) {
            return res.status(404).json({ error: 'Organização não encontrada.' });
        }
        res.json(identity);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar identidade.' });
    }
});
/**
 * PUT /templates/identity/:organizationId
 * Salva configuração de identidade visual. Gate de plano aplicado aqui.
 */
templateRoutes.put('/identity/:organizationId', auth_middleware_1.authMiddleware, org_access_middleware_1.requireOrgAccess, async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const data = req.body;
        const userId = req.user?.id;
        const result = await templateService.updateIdentity(organizationId, userId, data);
        res.json(result);
    }
    catch (error) {
        // Retorna erro claro para o frontend exibir o modal de upgrade
        if (error.message?.startsWith('PLAN_UPGRADE_REQUIRED:')) {
            const requiredPlan = error.message.split(':')[1];
            return res.status(403).json({ error: 'Upgrade necessário.', requiredPlan });
        }
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar identidade.' });
    }
});
exports.default = templateRoutes;
