/**
 * OrbitOS Core API — OpenAPI 3.0 Specification
 *
 * Admin spec: inclui TODOS os endpoints (incluindo internos, platform, billing)
 * Client spec: inclui apenas os endpoints consumidos pelo Dashboard do cliente
 */

// ─── Shared Components ────────────────────────────────────────────────────────

const baseComponents = {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token JWT obtido via POST /auth/discord/callback',
        },
        internalServiceKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-internal-service-key',
            description: 'Chave de serviço interno usada exclusivamente pelo Bot Engine',
        },
    },
    schemas: {
        // ── Primitivos ─────────────────────────────────
        Error: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Recurso não encontrado' },
            },
        },
        PaginatedMeta: {
            type: 'object',
            properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
            },
        },

        // ── Auth ───────────────────────────────────────
        User: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                discordId: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string', format: 'email' },
                avatar: { type: 'string', nullable: true },
                role: { type: 'string', enum: ['USER', 'SUPER_ADMIN'] },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },

        // ── Organization ───────────────────────────────
        Organization: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' },
                plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE', 'MAX'] },
                isActive: { type: 'boolean' },
                communityType: { type: 'string', enum: ['game', 'general', 'social'] },
                stripeCustomerId: { type: 'string', nullable: true },
                stripeSubscriptionId: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },

        // ── Server ─────────────────────────────────────
        Server: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                discordGuildId: { type: 'string' },
                icon: { type: 'string', nullable: true },
                isActive: { type: 'boolean' },
                organizationId: { type: 'string', format: 'uuid' },
                lastSeenAt: { type: 'string', format: 'date-time', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },

        // ── Ticket ─────────────────────────────────────
        Ticket: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                organizationId: { type: 'string', format: 'uuid' },
                serverId: { type: 'string', format: 'uuid' },
                authorId: { type: 'string' },
                channelId: { type: 'string', nullable: true },
                status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'RESOLVED'] },
                rating: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                closedAt: { type: 'string', format: 'date-time', nullable: true },
            },
        },

        // ── Automation ─────────────────────────────────
        Automation: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                organizationId: { type: 'string', format: 'uuid' },
                serverId: { type: 'string', format: 'uuid' },
                name: { type: 'string', example: 'Boas-vindas para novos membros' },
                description: { type: 'string', nullable: true },
                trigger: { type: 'string', example: 'member.joined' },
                conditions: { type: 'string', nullable: true, description: 'JSON array de condições' },
                actions: { type: 'string', description: 'JSON array de ações' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
        AutomationLog: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                automationId: { type: 'string', format: 'uuid' },
                organizationId: { type: 'string', format: 'uuid' },
                triggerEvent: { type: 'string' },
                status: { type: 'string', enum: ['SUCCESS', 'FAILED'] },
                error: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
        AutomationTrigger: {
            type: 'object',
            properties: {
                group: { type: 'string', example: 'Discord' },
                value: { type: 'string', example: 'member.joined' },
                label: { type: 'string', example: 'Membro entrou no servidor' },
                fields: { type: 'array', items: { type: 'string' }, example: ['userId', 'username', 'serverId'] },
            },
        },
        AutomationAction: {
            type: 'object',
            properties: {
                group: { type: 'string', example: 'Discord' },
                value: { type: 'string', example: 'discord.send_message' },
                label: { type: 'string', example: 'Enviar Mensagem' },
                driver: { type: 'string', example: 'discord' },
                type: { type: 'string', example: 'send_message' },
                params: { type: 'array', items: { type: 'string' }, example: ['channelId', 'content'] },
            },
        },

        // ── Billing ────────────────────────────────────
        BillingStatus: {
            type: 'object',
            properties: {
                plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE', 'MAX'] },
                isActive: { type: 'boolean' },
                stripeCustomerId: { type: 'string', nullable: true },
                stripeSubscriptionId: { type: 'string', nullable: true },
                usage: {
                    type: 'object',
                    properties: {
                        servers: { type: 'integer' },
                        tickets: { type: 'integer' },
                    },
                },
                invoices: { type: 'array', items: { type: 'object' } },
            },
        },

        // ── Store ──────────────────────────────────────
        Product: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                description: { type: 'string', nullable: true },
                price: { type: 'integer', description: 'Em centavos' },
                imageUrl: { type: 'string', nullable: true },
                stock: { type: 'integer', nullable: true },
                isActive: { type: 'boolean' },
            },
        },

        // ── Staff ──────────────────────────────────────
        StaffMember: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                userId: { type: 'string', format: 'uuid' },
                organizationId: { type: 'string', format: 'uuid' },
                role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MODERATOR', 'SUPPORT'] },
                user: { $ref: '#/components/schemas/User' },
            },
        },
    },
    responses: {
        UnauthorizedError: {
            description: '401 - Token inválido ou expirado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFoundError: {
            description: '404 - Recurso não encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ForbiddenError: {
            description: '403 - Sem permissão',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        PlanLimitError: {
            description: '402 - Limite do plano atingido',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ValidationError: {
            description: '400 - Dados inválidos',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
    },
};

// ─── CLIENT SPEC — O que o tenant vê ─────────────────────────────────────────

export const clientSpec = {
    openapi: '3.0.0',
    info: {
        title: 'OrbitOS API — Referência para Clientes',
        version: '2.0.0',
        description: `
## 📖 Documentação Oficial OrbitOS

Esta documentação descreve todos os endpoints disponíveis para clientes do plano OrbitOS (tenant dashboard).

### 🔐 Autenticação
Todas as rotas protegidas requerem um **JWT Bearer Token** no header:
\`\`\`
Authorization: Bearer <seu_token>
\`\`\`

O token é obtido ao fazer login via Discord OAuth2. Ele expira em **7 dias**.

### 📋 Planos e Limites
| Plano | Servidores | Tickets/mês | Produtos | Automações |
|-------|-----------|-------------|----------|-----------|
| FREE | 1 | 50 | 5 | 3 |
| PRO | 5 | 500 | 50 | 20 |
| ENTERPRISE | 20 | Ilimitado | Ilimitado | Ilimitado |
| MAX | Ilimitado | Ilimitado | Ilimitado | Ilimitado |

### 🔗 Base URL
- **Produção:** \`https://api.orbitup.io\`
- **Local:** \`http://localhost:4000\`
        `.trim(),
        contact: {
            name: 'Suporte OrbitOS',
            url: 'https://orbitup.io',
            email: 'suporte@orbitup.io',
        },
        license: { name: 'Privado', url: 'https://orbitup.io/terms' },
    },
    servers: [
        { url: 'https://api.orbitup.io', description: '🌐 Produção' },
        { url: 'http://localhost:4000', description: '💻 Desenvolvimento Local' },
    ],
    security: [{ bearerAuth: [] }],
    components: baseComponents,
    tags: [
        { name: '🔐 Autenticação', description: 'Login e refresh de sessão via Discord OAuth2' },
        { name: '🏢 Organização', description: 'Gerência da sua organização, membros e configurações' },
        { name: '🖥️ Servidores', description: 'Servidores Discord vinculados à sua organização' },
        { name: '🎫 Tickets', description: 'Gestão de tickets de suporte' },
        { name: '👥 Staff', description: 'Membros da equipe e permissões' },
        { name: '⚡ Automações', description: 'Engine de automações visuais Se-Então' },
        { name: '🛒 Loja', description: 'Produtos e pedidos da loja VIP' },
        { name: '💳 Billing', description: 'Plano, assinatura e histórico de faturas' },
        { name: '📊 Analytics', description: 'Estatísticas e métricas do dashboard' },
        { name: '🔧 Módulos', description: 'Módulos e recursos do bot' },
    ],
    paths: {
        // ── AUTH ───────────────────────────────────────────────────────────────
        '/auth/discord': {
            get: {
                tags: ['🔐 Autenticação'],
                summary: 'Iniciar login com Discord',
                description: 'Redireciona o usuário para o fluxo de autorização OAuth2 do Discord.',
                security: [],
                responses: {
                    302: { description: 'Redirecionamento para Discord OAuth2' },
                },
            },
        },
        '/auth/discord/callback': {
            get: {
                tags: ['🔐 Autenticação'],
                summary: 'Callback OAuth2 do Discord',
                description: 'Processa o código OAuth2 e retorna o JWT token. Redireciona para o dashboard após login.',
                security: [],
                parameters: [
                    { name: 'code', in: 'query', required: true, schema: { type: 'string' }, description: 'Código OAuth2 do Discord' },
                ],
                responses: {
                    302: { description: 'Redirecionamento para o dashboard com token configurado em cookie' },
                    400: { $ref: '#/components/responses/ValidationError' },
                },
            },
        },
        '/auth/me': {
            get: {
                tags: ['🔐 Autenticação'],
                summary: 'Dados do usuário logado',
                description: 'Retorna os dados do usuário autenticado, incluindo organizações.',
                responses: {
                    200: {
                        description: 'Dados do usuário',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
                    },
                    401: { $ref: '#/components/responses/UnauthorizedError' },
                },
            },
        },

        // ── ORGANIZATIONS ──────────────────────────────────────────────────────
        '/organizations/me': {
            get: {
                tags: ['🏢 Organização'],
                summary: 'Minhas organizações',
                description: 'Lista todas as organizações às quais o usuário autenticado pertence.',
                responses: {
                    200: {
                        description: 'Lista de organizações',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Organization' } },
                            },
                        },
                    },
                },
            },
        },
        '/organizations': {
            post: {
                tags: ['🏢 Organização'],
                summary: 'Criar organização',
                description: 'Cria uma nova organização. O usuário autenticado se torna OWNER automaticamente.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: { type: 'string', example: 'Minha Comunidade' },
                                    communityType: { type: 'string', enum: ['game', 'general', 'social'], default: 'general' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Organização criada',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Organization' } } },
                    },
                },
            },
        },
        '/organizations/{id}': {
            patch: {
                tags: ['🏢 Organização'],
                summary: 'Atualizar organização',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    slug: { type: 'string' },
                                    customDomain: { type: 'string' },
                                    language: { type: 'string' },
                                    communityType: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Organização atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Organization' } } } },
                    403: { $ref: '#/components/responses/ForbiddenError' },
                },
            },
        },

        // ── SERVERS ────────────────────────────────────────────────────────────
        '/servers': {
            get: {
                tags: ['🖥️ Servidores'],
                summary: 'Listar servidores',
                description: 'Lista todos os servidores Discord vinculados às suas organizações.',
                responses: {
                    200: {
                        description: 'Lista de servidores',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Server' } } } },
                    },
                },
            },
            post: {
                tags: ['🖥️ Servidores'],
                summary: 'Vincular servidor',
                description: 'Adiciona um servidor Discord à organização. **Limite do plano aplicado.**',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['discordGuildId', 'name', 'organizationId'],
                                properties: {
                                    discordGuildId: { type: 'string', example: '123456789012345678' },
                                    name: { type: 'string', example: 'Meu Servidor' },
                                    icon: { type: 'string', nullable: true },
                                    organizationId: { type: 'string', format: 'uuid' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Servidor vinculado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Server' } } } },
                    402: { $ref: '#/components/responses/PlanLimitError' },
                },
            },
        },

        // ── AUTOMATIONS ────────────────────────────────────────────────────────
        '/automations/triggers': {
            get: {
                tags: ['⚡ Automações'],
                summary: 'Listar gatilhos disponíveis',
                description: 'Retorna todos os eventos do sistema que podem disparar automações.',
                responses: {
                    200: {
                        description: 'Lista de triggers',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AutomationTrigger' } } } },
                    },
                },
            },
        },
        '/automations/actions': {
            get: {
                tags: ['⚡ Automações'],
                summary: 'Listar ações disponíveis',
                description: 'Retorna todas as ações que uma automação pode executar.',
                responses: {
                    200: {
                        description: 'Lista de ações',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AutomationAction' } } } },
                    },
                },
            },
        },
        '/automations/{organizationId}': {
            get: {
                tags: ['⚡ Automações'],
                summary: 'Listar automações',
                description: 'Lista todas as automações da organização com o último log de execução.',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: {
                    200: { description: 'Lista de automações', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Automation' } } } } },
                },
            },
            post: {
                tags: ['⚡ Automações'],
                summary: 'Criar automação',
                description: 'Cria uma nova regra de automação Se-Então para a organização.',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'serverId', 'trigger', 'actions'],
                                properties: {
                                    name: { type: 'string', example: 'Boas-vindas' },
                                    description: { type: 'string' },
                                    serverId: { type: 'string', format: 'uuid' },
                                    trigger: { type: 'string', example: 'member.joined' },
                                    conditions: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                field: { type: 'string', example: 'username' },
                                                op: { type: 'string', enum: ['eq', 'ne', 'contains'] },
                                                value: { type: 'string', example: 'Bot' },
                                            },
                                        },
                                    },
                                    actions: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                driver: { type: 'string', example: 'discord' },
                                                type: { type: 'string', example: 'send_message' },
                                                params: { type: 'object', additionalProperties: { type: 'string' } },
                                            },
                                        },
                                    },
                                    isActive: { type: 'boolean', default: true },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Automação criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Automation' } } } },
                },
            },
        },
        '/automations/{organizationId}/{id}': {
            get: {
                tags: ['⚡ Automações'],
                summary: 'Buscar automação por ID',
                parameters: [
                    { name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: { 200: { description: 'Automação encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Automation' } } } } },
            },
            put: {
                tags: ['⚡ Automações'],
                summary: 'Atualizar automação',
                parameters: [
                    { name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Automation' } } } },
                responses: { 200: { description: 'Automação atualizada' } },
            },
            delete: {
                tags: ['⚡ Automações'],
                summary: 'Excluir automação',
                parameters: [
                    { name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: { 200: { description: 'Automação removida com sucesso' } },
            },
        },
        '/automations/{organizationId}/{id}/toggle': {
            patch: {
                tags: ['⚡ Automações'],
                summary: 'Ativar/Pausar automação',
                parameters: [
                    { name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: { 200: { description: 'Status alternado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Automation' } } } } },
            },
        },
        '/automations/{organizationId}/{id}/logs': {
            get: {
                tags: ['⚡ Automações'],
                summary: 'Histórico de execuções',
                description: 'Retorna o log de execuções de uma automação.',
                parameters: [
                    { name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
                ],
                responses: { 200: { description: 'Logs de execução', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AutomationLog' } } } } } },
            },
        },
        '/automations/{organizationId}/{id}/test': {
            post: {
                tags: ['⚡ Automações'],
                summary: '🧪 Disparar teste',
                description: 'Dispara um evento de teste com o trigger da automação para validar a configuração.',
                parameters: [
                    { name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                ],
                responses: { 200: { description: 'Evento de teste disparado com sucesso' } },
            },
        },

        // ── TICKETS ────────────────────────────────────────────────────────────
        '/tickets': {
            get: {
                tags: ['🎫 Tickets'],
                summary: 'Listar tickets',
                description: 'Lista todos os tickets das organizações do usuário, com filtros.',
                parameters: [
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'RESOLVED'] } },
                    { name: 'organizationId', in: 'query', schema: { type: 'string', format: 'uuid' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                ],
                responses: {
                    200: {
                        description: 'Lista de tickets',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } } } },
                    },
                },
            },
        },
        '/tickets/{id}': {
            get: {
                tags: ['🎫 Tickets'],
                summary: 'Buscar ticket por ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Ticket encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ticket' } } } } },
            },
        },
        '/tickets/{id}/close': {
            post: {
                tags: ['🎫 Tickets'],
                summary: 'Fechar ticket',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Ticket fechado com sucesso' } },
            },
        },

        // ── BILLING ────────────────────────────────────────────────────────────
        '/billing/{organizationId}/status': {
            get: {
                tags: ['💳 Billing'],
                summary: 'Status de faturamento',
                description: 'Retorna o plano atual, dados de uso e histórico de faturas do Stripe.',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: {
                    200: { description: 'Status de billing', content: { 'application/json': { schema: { $ref: '#/components/schemas/BillingStatus' } } } },
                },
            },
        },
        '/billing/{organizationId}/checkout': {
            post: {
                tags: ['💳 Billing'],
                summary: 'Iniciar upgrade de plano',
                description: 'Cria uma sessão de checkout no Stripe para upgrade de plano. Retorna URL para redirecionamento.',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['priceId'],
                                properties: {
                                    priceId: { type: 'string', example: 'price_1ABC123', description: 'ID do preço no Stripe' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'URL de checkout gerada',
                        content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', format: 'uri' } } } } },
                    },
                },
            },
        },

        // ── STAFF ──────────────────────────────────────────────────────────────
        '/staff/{organizationId}': {
            get: {
                tags: ['👥 Staff'],
                summary: 'Listar membros da equipe',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Lista de membros', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/StaffMember' } } } } } },
            },
        },

        // ── STATS ──────────────────────────────────────────────────────────────
        '/stats/{organizationId}': {
            get: {
                tags: ['📊 Analytics'],
                summary: 'Estatísticas da organização',
                description: 'Retorna métricas e KPIs do dashboard: tickets, membros, receita.',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Estatísticas e métricas' } },
            },
        },

        // ── STORE ──────────────────────────────────────────────────────────────
        '/store/{organizationId}/products': {
            get: {
                tags: ['🛒 Loja'],
                summary: 'Listar produtos',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Lista de produtos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } },
            },
            post: {
                tags: ['🛒 Loja'],
                summary: 'Criar produto',
                description: '**Limite do plano aplicado.**',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
                },
                responses: {
                    201: { description: 'Produto criado' },
                    402: { $ref: '#/components/responses/PlanLimitError' },
                },
            },
        },

        // ── MODULES ────────────────────────────────────────────────────────────
        '/organizations/{organizationId}/modules': {
            get: {
                tags: ['🔧 Módulos'],
                summary: 'Listar módulos do bot',
                description: 'Retorna todos os módulos disponíveis com o status de ativação para a organização.',
                parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Lista de módulos' } },
            },
        },
        '/organizations/{organizationId}/modules/{moduleKey}/toggle': {
            post: {
                tags: ['🔧 Módulos'],
                summary: 'Ativar/Desativar módulo',
                parameters: [
                    { name: 'organizationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
                    { name: 'moduleKey', in: 'path', required: true, schema: { type: 'string', example: 'ticket' } },
                ],
                requestBody: {
                    content: { 'application/json': { schema: { type: 'object', properties: { active: { type: 'boolean' } } } } },
                },
                responses: { 200: { description: 'Status do módulo alterado' } },
            },
        },
    },
};

// ─── ADMIN SPEC — Tudo + rotas internas e de plataforma ──────────────────────

export const adminSpec = {
    ...clientSpec,
    info: {
        ...clientSpec.info,
        title: 'OrbitOS Core API — Referência para Administradores',
        description: `
## 🔒 Documentação de Administração — OrbitOS

> ⚠️ **Esta documentação é restrita a administradores da plataforma.**
> As rotas do Bot Engine exigem a **Internal Service Key** e não estão disponíveis para clientes.

### Escopos de Acesso
| Escopo | Como autenticar |
|--------|----------------|
| Dashboard (Tenant) | JWT Bearer Token |
| Bot Engine (Interno) | \`x-internal-service-key\` header |
| Platform Admin | JWT com role SUPER_ADMIN |

### Arquitetura
\`\`\`
Dashboard (Next.js)  →  Core API      → Prisma → PostgreSQL
Bot Engine           →  /internal     → Core API
Stripe Webhooks      →  /webhook      → Core API
WebSocket            →  ws://...      → Dashboard
\`\`\`

${clientSpec.info.description}
        `.trim(),
    },
    tags: [
        ...clientSpec.tags,
        { name: '🤖 Bot Engine (Interno)', description: 'Endpoints exclusivos do Bot Engine. Requerem `x-internal-service-key`.' },
        { name: '🛡️ Platform Admin', description: 'Endpoints de administração da plataforma. Requer role SUPER_ADMIN.' },
        { name: '💰 Pagamentos', description: 'Webhooks e processamento de pagamentos Stripe' },
    ],
    paths: {
        ...clientSpec.paths,

        // ── INTERNAL (Bot Engine) ──────────────────────────────────────────────
        '/internal/sync-guild': {
            post: {
                tags: ['🤖 Bot Engine (Interno)'],
                summary: 'Sincronizar guild Discord',
                description: 'Chamado pelo Bot Engine quando entra em um novo servidor Discord. Atualiza nome, ícone e marca como ativo.',
                security: [{ internalServiceKey: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['discordGuildId', 'name'],
                                properties: {
                                    discordGuildId: { type: 'string', example: '123456789012345678' },
                                    name: { type: 'string', example: 'FiveM Community' },
                                    icon: { type: 'string', nullable: true },
                                    memberCount: { type: 'integer' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Servidor sincronizado' },
                    404: { description: 'Servidor não associado a nenhuma organização no SaaS' },
                },
            },
        },
        '/internal/guild/{guildId}/disconnect': {
            post: {
                tags: ['🤖 Bot Engine (Interno)'],
                summary: 'Desconectar guild',
                description: 'Chamado quando o bot é removido de um servidor. Marca o servidor como inativo.',
                security: [{ internalServiceKey: [] }],
                parameters: [{ name: 'guildId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Servidor marcado como desconectado' } },
            },
        },
        '/internal/tickets': {
            post: {
                tags: ['🤖 Bot Engine (Interno)'],
                summary: 'Criar ticket via Discord',
                description: 'Chamado pelo Bot Engine quando um usuário abre um ticket no Discord. **Limite do plano aplicado.**',
                security: [{ internalServiceKey: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['discordGuildId', 'authorId', 'subject'],
                                properties: {
                                    discordGuildId: { type: 'string' },
                                    authorId: { type: 'string', description: 'Discord User ID' },
                                    subject: { type: 'string' },
                                    description: { type: 'string' },
                                    channelId: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Ticket criado com sucesso' },
                    402: { $ref: '#/components/responses/PlanLimitError' },
                    404: { description: 'Servidor não encontrado no SaaS' },
                },
            },
        },
        '/internal/tickets/{id}/close': {
            post: {
                tags: ['🤖 Bot Engine (Interno)'],
                summary: 'Fechar ticket via Discord',
                description: 'Chamado quando o ticket é fechado pelo bot no Discord.',
                security: [{ internalServiceKey: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Ticket fechado' } },
            },
        },
        '/internal/giveaways': {
            post: {
                tags: ['🤖 Bot Engine (Interno)'],
                summary: 'Registrar sorteio',
                description: 'Registra um sorteio criado no Discord. **Limite do plano aplicado.**',
                security: [{ internalServiceKey: [] }],
                responses: {
                    201: { description: 'Sorteio registrado' },
                    402: { $ref: '#/components/responses/PlanLimitError' },
                },
            },
        },
        '/internal/allowlist/{formId}/submit': {
            post: {
                tags: ['🤖 Bot Engine (Interno)'],
                summary: 'Submeter allowlist',
                security: [{ internalServiceKey: [] }],
                parameters: [{ name: 'formId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 201: { description: 'Allowlist submetida' } },
            },
        },

        // ── WEBHOOK ────────────────────────────────────────────────────────────
        '/webhook/stripe': {
            post: {
                tags: ['💰 Pagamentos'],
                summary: 'Webhook Stripe',
                description: `
Endpoint chamado pelo Stripe para notificar eventos de pagamento.

**Eventos suportados:**
- \`checkout.session.completed\` → Processa upgrade de plano ou pagamento de pedido
- \`invoice.payment_succeeded\` → Renova assinatura, mantém org ativa
- \`customer.subscription.deleted\` → Downgrade automático para plano FREE

O body deve ser enviado **raw** (não JSON) para validação de assinatura Stripe.
                `.trim(),
                security: [],
                requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
                responses: {
                    200: { description: 'Evento processado' },
                    400: { description: 'Assinatura inválida ou evento não reconhecido' },
                },
            },
        },

        // ── PLATFORM ADMIN ─────────────────────────────────────────────────────
        '/platform/organizations': {
            get: {
                tags: ['🛡️ Platform Admin'],
                summary: 'Listar todas as organizações',
                description: 'Lista todas as organizações cadastradas na plataforma. **Requer SUPER_ADMIN.**',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                    { name: 'plan', in: 'query', schema: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE', 'MAX'] } },
                ],
                responses: { 200: { description: 'Lista de organizações com paginação' } },
            },
        },
        '/platform/organizations/{id}/plan': {
            patch: {
                tags: ['🛡️ Platform Admin'],
                summary: 'Alterar plano de organização',
                description: 'Altera o plano de uma organização manualmente. **Requer SUPER_ADMIN.**',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['plan'],
                                properties: {
                                    plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE', 'MAX'] },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: 'Plano atualizado' } },
            },
        },
        '/platform/users': {
            get: {
                tags: ['🛡️ Platform Admin'],
                summary: 'Listar todos os usuários',
                description: '**Requer SUPER_ADMIN.**',
                responses: { 200: { description: 'Lista de usuários' } },
            },
        },
        '/platform/impersonate/{userId}': {
            post: {
                tags: ['🛡️ Platform Admin'],
                summary: 'Impersonar usuário',
                description: 'Gera um token JWT temporário para suporte técnico. **Requer SUPER_ADMIN.**',
                parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
                responses: { 200: { description: 'Token de impersonação gerado' } },
            },
        },
    },
};
