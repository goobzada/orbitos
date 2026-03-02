"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_CONFIG = exports.ENTERPRISE_MODULES = exports.PRO_MODULES = exports.FREE_MODULES = void 0;
exports.isModuleAvailable = isModuleAvailable;
exports.getTicketFeatures = getTicketFeatures;
// Modules available per plan
exports.FREE_MODULES = [
    'welcome_message',
    'autorole',
    'ticket',
    'verification',
];
exports.PRO_MODULES = [
    ...exports.FREE_MODULES,
    'level_system',
    'anti_raid',
    'suggestion',
    'rules_accept',
    'report',
    'giveaways',
    'server_status',
    'whitelist',
];
exports.ENTERPRISE_MODULES = [
    ...exports.PRO_MODULES,
    'whitelist_quiz',
    'application',
    'store_panel',
    'coupon',
    'growth_stats',
    'engagement_stats',
    'revenue_stats',
    'activity_stats',
];
exports.PLAN_CONFIG = {
    FREE: {
        maxServers: 1,
        maxStaff: 3,
        maxTicketsPerDay: 50,
        availableModules: exports.FREE_MODULES,
        ticketFeatures: {
            branding: false,
            bannerImage: false,
            dmOnOpen: false,
            customCategories: false,
            transcripts: false,
        },
        features: [
            '1 servidor Discord',
            'Ticket básico (sem banner)',
            'Boas-vindas automática',
            'Auto-cargo ao entrar',
            'Verificação de membros',
            'Suporte por e-mail',
        ]
    },
    PRO: {
        maxServers: 5,
        maxStaff: 15,
        maxTicketsPerDay: 1000,
        availableModules: exports.PRO_MODULES,
        ticketFeatures: {
            branding: true,
            bannerImage: true,
            dmOnOpen: true,
            customCategories: true,
            transcripts: true,
        },
        features: [
            'Até 5 servidores Discord',
            'Banner + DM personalizado no Ticket',
            'Sistema de Níveis (XP)',
            'Anti-Raid automático',
            'Sorteios (Giveaways)',
            'Status ao vivo do servidor',
            'Whitelist FiveM',
            'Sistema de Sugestões',
            'Analytics completo',
            'Suporte prioritário',
        ]
    },
    ENTERPRISE: {
        maxServers: 999,
        maxStaff: 999,
        maxTicketsPerDay: 999999,
        availableModules: ['*'],
        ticketFeatures: {
            branding: true,
            bannerImage: true,
            dmOnOpen: true,
            customCategories: true,
            transcripts: true,
        },
        features: [
            'Servidores ilimitados',
            'Quiz de Whitelist FiveM',
            'Formulário de Candidatura',
            'Loja integrada + Cupons',
            'Relatórios de receita',
            'SLA garantido 99.9%',
            'Gerente de conta dedicado',
            'Integrações customizadas',
            'API pública + Webhooks',
            'Suporte 24/7',
        ]
    }
};
/**
 * Check if a module is available for a given plan
 */
function isModuleAvailable(plan, moduleKey) {
    const config = exports.PLAN_CONFIG[plan];
    if (!config)
        return false;
    if (config.availableModules.includes('*'))
        return true;
    return config.availableModules.includes(moduleKey);
}
/**
 * Get ticket feature availability for a plan
 */
function getTicketFeatures(plan) {
    return exports.PLAN_CONFIG[plan]?.ticketFeatures || exports.PLAN_CONFIG['FREE'].ticketFeatures;
}
