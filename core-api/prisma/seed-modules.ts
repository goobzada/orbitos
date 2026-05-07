import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const modules = [
    // Onboarding
    { key: 'welcome_message', name: 'Mensagem de Boas-vindas', category: 'Onboarding', description: 'Envia mensagens personalizadas quando novos membros entram no servidor.' },
    { key: 'autorole', name: 'Auto Role', category: 'Onboarding', description: 'Atribui cargos automaticamente para novos membros.' },
    { key: 'rules_accept', name: 'Aceite de Regras', category: 'Onboarding', description: 'Exige que membros aceitem as regras antes de liberar canais.' },
    { key: 'verification', name: 'Verificação Simples', category: 'Onboarding', description: 'Sistema de verificação por botão para evitar bots.' },

    // Support
    { key: 'ticket', name: 'Sistema de Tickets', category: 'Support', description: 'Gerencie suporte via canais privados e embeds.' },
    { key: 'application', name: 'Formulários/Recrutamento', category: 'Support', description: 'Crie formulários de inscrição e recrutamento.' },
    { key: 'suggestion', name: 'Sugestões', category: 'Support', description: 'Canal dedicado para membros enviarem melhorias.' },
    { key: 'report', name: 'Denúncias', category: 'Support', description: 'Sistema para reporte anônimo de infrações.' },

    // Engagement
    { key: 'level_system', name: 'Sistema de Níveis', category: 'Engagement', description: 'Recompense membros ativos com XP e níveis.' },
    { key: 'ranking', name: 'Rankings/Leaderboard', category: 'Engagement', description: 'Exiba os membros mais ativos ou com mais XP.' },
    { key: 'giveaway', name: 'Sorteios', category: 'Engagement', description: 'Crie e gerencie sorteios automáticos no Discord.' },
    { key: 'poll', name: 'Votações/Enquetes', category: 'Engagement', description: 'Crie enquetes interativas para a comunidade.' },
    { key: 'referral_system', name: 'Sistema de Referências', category: 'Engagement', description: 'Sistema de convites e ranking de indicações com prêmios.' },

    // Monetization
    { key: 'store_panel', name: 'Painel da Loja', category: 'Monetization', description: 'Exibe os produtos da sua loja diretamente no Discord.' },
    { key: 'payment_logs', name: 'Logs de Pagamento', category: 'Monetization', description: 'Canal de staff para acompanhar vendas em tempo real.' },
    { key: 'subscription', name: 'Assinaturas Recorrentes', category: 'Monetization', description: 'Gerencie cargos vinculados a planos mensais.' },
    { key: 'coupon', name: 'Cupons de Desconto', category: 'Monetization', description: 'Crie códigos promocionais para sua loja.' },
    { key: 'flash_sale', name: 'Ofertas Relâmpago', category: 'Monetization', description: 'Notifique promoções por tempo limitado.' },

    // Security
    { key: 'anti_raid', name: 'Anti Raid', category: 'Security', description: 'Proteção contra entrada massiva de bots ou ataques.' },
    { key: 'anti_alt', name: 'Anti Alt/Fake', category: 'Security', description: 'Bloqueia contas criadas recentemente.' },
    { key: 'mod_logs', name: 'Logs de Moderação', category: 'Security', description: 'Registro detalhado de bans, kicks e deletes.' },
    { key: 'staff_logs', name: 'Logs de Equipe', category: 'Security', description: 'Acompanhe as ações feitas pela sua staff.' },
    { key: 'advanced_verification', name: 'Verificação Avançada', category: 'Security', description: 'Verificação vinculada a site ou redes sociais.' },

    // Automation
    { key: 'scheduled_messages', name: 'Mensagens Agendadas', category: 'Automation', description: 'Envie anúncios ou lembretes em horários fixos.' },
    { key: 'conditional_workflow', name: 'Workflows Condicionais', category: 'Automation', description: 'Ações automáticas baseadas em gatilhos específicos.' },
    { key: 'trigger_system', name: 'Sistema de Gatilhos', category: 'Automation', description: 'Respostas automáticas para palavras-chave.' },

    // Game Integration
    { key: 'whitelist', name: 'Sistema de Whitelist', category: 'Game Integration', description: 'Vincule a entrada no Discord ao acesso ao jogo.' },
    { key: 'server_status', name: 'Status do Servidor', category: 'Game Integration', description: 'Exibe quantos players estão online no jogo.' },
    { key: 'faction_system', name: 'Sistema de Facções', category: 'Game Integration', description: 'Gestão de grupos e hierarquias in-game.' },
    { key: 'judicial_system', name: 'Sistema Judicial', category: 'Game Integration', description: 'Logs e controle de multas/prisões do jogo.' },
    { key: 'in_game_logs', name: 'Logs In-Game', category: 'Game Integration', description: 'Veja o que acontece no jogo pelo Discord.' },

    // Analytics
    { key: 'growth_stats', name: 'Estatísticas de Crescimento', category: 'Analytics', description: 'Gráficos de entrada e saída de membros.' },
    { key: 'engagement_stats', name: 'Estatísticas de Engajamento', category: 'Analytics', description: 'Veja quais canais são mais utilizados.' },
    { key: 'revenue_stats', name: 'Estatísticas Financeiras', category: 'Analytics', description: 'Acompanhe o faturamento da sua comunidade.' },
    { key: 'activity_stats', name: 'Estatísticas de Atividade', category: 'Analytics', description: 'Logs de atividade por cargo ou membro.' },
    { key: 'whitelist_quiz', name: 'Quiz de Whitelist Automático', category: 'Game Integration', description: 'Teste de conhecimentos RP com aprovação automática baseada em acertos.' },
    
    // Entertainment
    { key: 'music_system', name: 'Sistema de Música', category: 'Entertainment', description: 'Tocar músicas e playlists do YouTube/Spotify com qualidade premium.' },
];

export const presets = [
    // Welcome Message Presets
    {
        moduleKey: 'welcome_message', communityType: 'game',
        config: { title: '🎮 Nova Entrada no Servidor!', description: 'Olá {user}, seja bem-vindo ao mundo de {guild}! Atualmente somos {memberCount} jogadores.', color: '#00FF00', mentionUser: true }
    },
    {
        moduleKey: 'welcome_message', communityType: 'business',
        config: { title: '💼 Seja bem-vindo!', description: 'Olá {user}, é um prazer tê-lo em nossa comunidade corporativa {guild}. Estamos à disposição.', color: '#FFFFFF', mentionUser: false }
    },
    {
        moduleKey: 'welcome_message', communityType: 'general',
        config: { title: '✨ Bem-vindo!', description: 'Olá {user}, sinta-se em casa no {guild}! Não esqueça de ler as regras.', color: '#5865F2', mentionUser: true }
    },

    // Ticket Presets
    {
        moduleKey: 'ticket', communityType: 'game',
        config: { ticketCategories: ['Suporte In-Game', 'Denúncia Player', 'Bugs/Erros', 'Financeiro'], title: '🎫 Central de Atendimento Game' }
    },
    {
        moduleKey: 'ticket', communityType: 'business',
        config: { ticketCategories: ['Suporte Técnico', 'Financeiro/Faturamento', 'Dúvidas Gerais'], title: '📞 Canal de Atendimento' }
    },
    {
        moduleKey: 'ticket', communityType: 'general',
        config: { ticketCategories: ['Suporte Geral', 'Dúvidas', 'Sugestões'], title: '🎫 Sistema de Tickets' }
    },

    // Auto Role Presets
    {
        moduleKey: 'autorole', communityType: 'game',
        config: { roleIds: [], note: 'Cargos recomendados: Membro, Jogador' }
    },
    {
        moduleKey: 'autorole', communityType: 'general',
        config: { roleIds: [], note: 'Cargos recomendados: Membro, Verificado' }
    },

    // Level System Presets
    {
        moduleKey: 'level_system', communityType: 'general',
        config: { xpMultiplier: 1.0, voiceXpEnabled: true, rankChannelId: null }
    },

    // Anti Raid Presets
    {
        moduleKey: 'anti_raid', communityType: 'general',
        config: { threshold: 5, action: 'LOCKDOWN' }
    },

    // Verification Presets
    {
        moduleKey: 'verification', communityType: 'general',
        config: { channelId: '', roleId: '', message: 'Clique no botão abaixo para se verificar no servidor!' }
    },

    // Suggestion Presets
    {
        moduleKey: 'suggestion', communityType: 'general',
        config: { channelId: '', anonymous: false, upvoteEmoji: '👍', downvoteEmoji: '👎' }
    },

    // Rules Accept Presets
    {
        moduleKey: 'rules_accept', communityType: 'general',
        config: { channelId: '', roleId: '', rules: '1. Respeite todos os membros.\n2. Proibido spam ou flood.\n3. Proibido conteúdo NSFW.' }
    },

    // Whitelist Presets
    {
        moduleKey: 'whitelist', communityType: 'game',
        config: {
            roleId: '',
            syncEnabled: true,
            questions: [
                'Qual seu ID (In-game)?',
                'Por que você quer entrar na cidade?',
                'Já jogou em algum outro servidor?',
                'Qual sua idade (OOC)?'
            ],
            verificationType: 'CODE', // CODE or ID
            codeLength: 6,
            autoApprove: false
        }
    },

    // Server Status Presets
    {
        moduleKey: 'server_status', communityType: 'game',
        config: { template: 'Online: {players}', channelId: '' }
    },

    // Store Panel Presets
    {
        moduleKey: 'store_panel', communityType: 'general',
        config: { channelId: '', autoUpdate: true }
    },

    {
        moduleKey: 'application', communityType: 'game',
        config: { applicationRoleId: '', questions: ['Qual seu ID?', 'Por que quer entrar?', 'Qual seu horário?'] }
    },

    // Whitelist Quiz Presets
    {
        moduleKey: 'whitelist_quiz', communityType: 'game',
        config: {
            roleId: '',
            passPercentage: 80,
            autoApprove: true,
            questions: [
                { id: 1, text: 'O que é RP (Roleplay)?', options: ['Viver a vida de um personagem virtual como se fosse real', 'Um modo de jogo focado apenas em guerra', 'Jogar para ganhar de todo mundo'], correctAnswer: 0 },
                { id: 2, text: 'O que caracteriza VDM (Vehicle Deathmatch)?', options: ['Atropelar alguém sem motivo aparente', 'Dirigir um carro em alta velocidade', 'Explodir um veículo inimigo'], correctAnswer: 0 },
                { id: 3, text: 'O que é RDM (Random Deathmatch)?', options: ['Matar alguém sem motivo de RP ou interação prévia', 'Matar alguém durante uma guerra', 'Morrer por acidente no mapa'], correctAnswer: 0 },
                { id: 4, text: 'O que é PowerGaming?', options: ['Realizar ações impossíveis na vida real para benefício próprio', 'Ter o personagem mais forte', 'Gastar muito dinheiro no jogo'], correctAnswer: 0 },
                { id: 5, text: 'O que é MetaGaming?', options: ['Usar informações de fora do jogo (OOC) dentro do Roleplay (IC)', 'Jogar em um PC potente', 'Seguir as metas do servidor'], correctAnswer: 0 },
                { id: 6, text: 'O que significa IC e OOC?', options: ['In Character (No Personagem) e Out Of Character (Fora)', 'In City e Out Of City', 'Internal Code e Outer Code'], correctAnswer: 0 },
                { id: 7, text: 'O que deve fazer ao ser assaltado?', options: ['Valorizar a vida (Fear RP) e seguir ordens', 'Tentar fugir ou revidar', 'Deslogar do servidor'], correctAnswer: 0 },
                { id: 8, text: 'O que é Combat Log?', options: ['Sair do jogo durante uma ação para não perder', 'Registrar as mortes em arquivo', 'Lutar contra a polícia'], correctAnswer: 0 },
                { id: 9, text: 'O que é Safe Zone?', options: ['Local proibido para ações agressivas ou crimes', 'Local com melhor loot', 'Área apenas para Staff'], correctAnswer: 0 },
                { id: 10, text: 'Principal regra para entrar em facção?', options: ['Ter história (Lore) condizente e interações simples', 'Ter a melhor mira', 'Pagar taxa em dinheiro real'], correctAnswer: 0 }
            ]
        }
    },

    // Report Presets
    {
        moduleKey: 'report', communityType: 'general',
        config: { channelId: '', anonymous: true }
    },

    // Referral System Presets
    {
        moduleKey: 'referral_system', communityType: 'general',
        config: { points_per_referral: 1, min_account_age_days: 7, log_channel_id: null }
    },

    // Monetization Presets
    {
        moduleKey: 'payment_logs', communityType: 'general',
        config: { channelId: '', showCustomerName: true, showAmount: true }
    },
    {
        moduleKey: 'subscription', communityType: 'general',
        config: { checkIntervalHours: 24, gracePeriodDays: 3 }
    },
    {
        moduleKey: 'coupon', communityType: 'general',
        config: { logChannelId: '', allowStacking: false }
    },
    {
        moduleKey: 'flash_sale', communityType: 'general',
        config: { announcementChannelId: '', mentionRole: '' }
    },

    // Security Presets
    {
        moduleKey: 'anti_alt', communityType: 'general',
        config: { minAccountAgeDays: 7, action: 'KICK' }
    },
    {
        moduleKey: 'mod_logs', communityType: 'general',
        config: { channelId: '', ignoreBots: true }
    },
    {
        moduleKey: 'staff_logs', communityType: 'general',
        config: { channelId: '', logAdminActions: true }
    },
    {
        moduleKey: 'advanced_verification', communityType: 'general',
        config: { type: 'WEBSITE', url: '', requiredRole: '' }
    },

    // Automation Presets
    {
        moduleKey: 'scheduled_messages', communityType: 'general',
        config: { messages: [] }
    },
    {
        moduleKey: 'conditional_workflow', communityType: 'general',
        config: { rules: [] }
    },
    {
        moduleKey: 'trigger_system', communityType: 'general',
        config: { triggers: [] }
    },

    // Engagement Presets
    {
        moduleKey: 'ranking', communityType: 'general',
        config: { updateIntervalMinutes: 60, topLimit: 10 }
    },
    {
        moduleKey: 'giveaway', communityType: 'general',
        config: { defaultEmoji: '🎉', logChannelId: '' }
    },
    {
        moduleKey: 'poll', communityType: 'general',
        config: { allowedRoles: [], resultsChannelId: '' }
    },

    // Game Integration Presets
    {
        moduleKey: 'faction_system', communityType: 'game',
        config: { allowCreation: true, memberLimit: 20 }
    },
    {
        moduleKey: 'judicial_system', communityType: 'game',
        config: { logChannelId: '', allowFineManagement: true }
    },
    {
        moduleKey: 'in_game_logs', communityType: 'game',
        config: { channelId: '', filterCategories: ['chat', 'kill', 'admin'] }
    },

    // Analytics Presets
    {
        moduleKey: 'growth_stats', communityType: 'general',
        config: { trackInvites: true, trackLeaves: true }
    },
    {
        moduleKey: 'engagement_stats', communityType: 'general',
        config: { mostActiveChannelLimit: 5 }
    },
    {
        moduleKey: 'revenue_stats', communityType: 'general',
        config: { currency: 'BRL', showDailyChart: true }
    },
    {
        moduleKey: 'activity_stats', communityType: 'general',
        config: { trackVoiceTime: true, trackMessageCount: true }
    },
    
    // Entertainment Presets
    {
        moduleKey: 'music_system', communityType: 'general',
        config: { defaultVolume: 50, autoLeaveVoice: true }
    }
];

async function main() {
    console.log('🌱 Iniciando seed de módulos e presets...');

    for (const mod of modules) {
        const createdModule = await prisma.module.upsert({
            where: { key: mod.key },
            update: mod,
            create: mod,
        });

        let modulePresetsToUpsert = presets.filter(p => p.moduleKey === mod.key);

        // Check if a 'general' preset exists for this module
        const hasGeneralPreset = modulePresetsToUpsert.some(p => p.communityType === 'general');

        // If no 'general' preset exists, add a default one
        if (!hasGeneralPreset) {
            modulePresetsToUpsert.push({
                moduleKey: mod.key,
                communityType: 'general',
                config: {} as any // Empty config as default
            });
        }

        // Upsert all presets for this module, including the potentially added default 'general'
        for (const preset of modulePresetsToUpsert) {
            await prisma.modulePreset.upsert({
                where: {
                    moduleId_communityType: {
                        moduleId: createdModule.id,
                        communityType: preset.communityType
                    }
                },
                update: { presetConfig: preset.config as any },
                create: {
                    moduleId: createdModule.id,
                    communityType: preset.communityType,
                    presetConfig: preset.config as any
                },
            });
        }
    }

    console.log('✅ Seed de módulos e presets finalizado!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
