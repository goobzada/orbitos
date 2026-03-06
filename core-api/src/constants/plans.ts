export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE' | 'MAX';

export interface PlanLimits {
    maxServers: number;
    maxStaff: number;
    maxTicketsPerDay: number;
    availableModules: string[]; // ['*'] means all
    ticketFeatures: {
        branding: boolean;      // custom colors, footer text
        bannerImage: boolean;   // image in panel embed (top/bottom)
        dmOnOpen: boolean;      // DM to user when ticket is opened
        customCategories: boolean;
        transcripts: boolean;
    };
    features: string[];
}

// Modules available per plan
export const FREE_MODULES = [
    'welcome_message',
    'autorole',
    'ticket',
    'verification',
];

export const PRO_MODULES = [
    ...FREE_MODULES,
    'level_system',
    'anti_raid',
    'suggestion',
    'rules_accept',
    'report',
    'giveaways',
    'server_status',
    'whitelist',
];

export const ENTERPRISE_MODULES = [
    ...PRO_MODULES,
    'whitelist_quiz',
    'application',
    'store_panel',
    'coupon',
    'growth_stats',
    'engagement_stats',
    'revenue_stats',
    'activity_stats',
];

export const MAX_MODULES = [
    ...ENTERPRISE_MODULES,
    'faction_system',
    'judicial_system',
    'conditional_workflow',
    'trigger_system',
    'advanced_verification',
    'payment_logs',
    'subscription',
    'mod_logs',
    'staff_logs',
    'in_game_logs',
    'ranking',
    'poll',
    'flash_sale',
    'server_status',
];

export const PLAN_CONFIG: Record<PlanType, PlanLimits> = {
    FREE: {
        maxServers: 1,
        maxStaff: 3,
        maxTicketsPerDay: 50,
        availableModules: FREE_MODULES,
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
        availableModules: PRO_MODULES,
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
    },
    MAX: {
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
            'Tudo do plano Enterprise',
            'Sistema de Facções (FiveM)',
            'Sistema Judicial integrado',
            'Automação condicional avançada',
            'Triggers personalizados ilimitados',
            'Logs de jogo + Staff + Moderação',
            'Flash Sale + Assinaturas recorrentes',
            'Ranking de membros permanente',
            'Votações avançadas (Polls)',
            'Templates MAX exclusivos',
            'SLA premium 99.99%',
            'Suporte dedicado 24/7 + onboarding',
        ]
    }
};

/**
 * Check if a module is available for a given plan
 */
export function isModuleAvailable(plan: PlanType, moduleKey: string): boolean {
    const config = PLAN_CONFIG[plan];
    if (!config) return false;
    if (config.availableModules.includes('*')) return true;
    return config.availableModules.includes(moduleKey);
}

/**
 * Get ticket feature availability for a plan
 */
export function getTicketFeatures(plan: PlanType) {
    return PLAN_CONFIG[plan]?.ticketFeatures || PLAN_CONFIG['FREE'].ticketFeatures;
}
