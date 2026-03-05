export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export const translations: Record<Language, any> = {
    'pt-BR': {
        landing: {
            nav: {
                ecosystem: "Ecossistema",
                infra: "Infraestrutura",
                brandEngine: "Brand Engine",
                dashboard: "Dashboard",
            },
            hero: {
                badge: "OrbitOS V1.0 Lançado",
                title1: "O sistema operacional para",
                title2: "comunidades digitais.",
                desc: "Infraestrutura multi-tenant para Discord, jogos e plataformas digitais. Controle total, monetização integrada e arquitetura pronta para escalar.",
                cta1: "Começar Gratuitamente",
                cta2: "Ver Arquitetura",
                no_card: "Sem cartão de crédito",
                setup_time: "Setup em 2 minutos",
                cancel_anytime: "Cancelamento a qualquer momento",
            },
            ecosystem: {
                badge: "Expansibilidade Infinita",
                title: "Um núcleo. Múltiplos ambientes.",
                desc: "O Discord é apenas o primeiro módulo. Projetamos o OrbitUp.io para ser o hub central de toda a sua operação digital.",
                soon: "Em Breve",
                discord_title: "Discord",
                discord_desc: "Gestão completa de servidores, cargos, tickets e automações.",
                games_title: "Games",
                games_desc: "Integração nativa com servidores FiveM, Minecraft e Rust.",
                commerce_title: "Commerce",
                commerce_desc: "Lojas vitrines próprias com checkout de alta conversão.",
                api_title: "API Integrada",
                api_desc: "Controle sua operação via Webhooks customizados.",
            },
            infra: {
                badge: "Arquitetura de Alto Nível",
                title1: "Arquitetura construída para",
                title2: "escalar.",
                desc: "O OrbitUp.io roda silenciosamente sobre uma pilha robusta de nível corporativo. Seu core isola operações, roteia tráfego seguro e audita cada passo dos seus usuários.",
                multi_tenant_title: "PostgreSQL Multi-Tenant",
                multi_tenant_desc: "Isolamento de dados por organização.",
                websocket_title: "WebSocket Autenticado",
                websocket_desc: "Heartbeats e eventos securizados.",
                stripe_title: "Stripe Webhooks V2",
                stripe_desc: "Assinaturas criptografadas check-out.",
                audit_title: "Audit & Moderation Logs",
                audit_desc: "Rastreabilidade de 100% das ações.",
            },
            brand: {
                badge: "Orbit Brand Engine",
                title1: "Sua comunidade.",
                title2: "Sua marca.",
                desc: "O OrbitUp.io possui um White-Label nativo. Com o Brand Engine integrado, você implementa identidades visuais impressionantes e tokens de cor isolados em menos de um clique.",
            },
            audience: {
                title: "Construído para líderes digitais.",
                creators_title: "Criadores",
                creators_desc: "Monetize sua audiência com planos recorrentes e conteúdo VIP gateado.",
                owners_title: "Donos de Servidores",
                owners_desc: "Automatize a moderação e suporte para focar no engajamento da comunidade.",
                enterprise_title: "Empresas",
                enterprise_desc: "Forneça suporte B2B white-label com histórico de SLA garantido e tickets.",
                devs_title: "Desenvolvedores",
                devs_desc: "Uma fundação robusta para você parar de re-escrever sistemas de autenticação.",
            },
            comparison: {
                title: "Por que não usar bots comuns?",
                desc: "A diferença entre administrar um hobby e escalar um negócio no Discord.",
                bad_title: "Bots Comuns",
                good_title: "OrbitUp.io",
                row1: "Arquitetura de servidor único",
                row2: "Design engessado pro plano FREE",
                row3: "Sem registros de auditoria (Logs)",
                row4: "Zero controle de Stripe / Monetização",
                row5: "Permissões limitadas (Todos são Admin)",
                row1_good: "Multi-tenant isolado por organização",
                row2_good: "Template Engine White Label",
                row3_good: "Audit Logs completos e rastreáveis",
                row4_good: "Stripe Webhooks & Gating 100% nativo",
                row5_good: "Role-Based Access Control (RBAC)",
            },
            cta_final: {
                title: "Pronto para assumir o controle do seu ecossistema digital?",
                desc: "Crie sua infraestrutura global hoje e pare de administrar sua comunidade como um hobby de fim de semana.",
                button: "Criar Conta Gratuitamente",
            },
            footer: {
                terms: "Termos",
                privacy: "Privacidade",
                copyright: "Sistema Operacional para Comunidades Digitais.",
            },
            common: {
                loading: "Carregando...",
                error: "Ocorreu um erro",
                success: "Sucesso",
                status: "Status",
                show: "Revelar",
                hide: "Ocultar",
                saving: "Salvando...",
                coming_soon: "Em breve",
            }
        },
        dashboard: {
            sidebar: {
                menu: "Menu Principal",
                system: "Sistema",
                analytics: "Analytics",
                automations: "Automações",
                automation_builder: "⚡ Automation Builder",
                servers: "Servidores",
                tickets: "Tickets",
                staff: "Staff",
                store: "Loja VIP",
                billing: "Faturamento",
                api_docs: "API Docs",
                settings: "Configurações",
                platform: "Administração",
                profile: "Meu Perfil",
                view_profile: "Ver perfil",
                logout: "Sair da conta",
                exit_support: "Encerrar Suporte",
            },
            bread: {
                overview: "Visão Geral",
                servers: "Servidores",
                tickets: "Chamados",
                staff: "Equipe",
                analytics: "Análises",
                billing: "Financeiro",
                settings: "Preferências",
                platform: "Plataforma",
                organizations: "Organizações",
            },
            header: {
                servers_growth: "+12 SERVIDORES ESSA SEMANA",
                loading: "Carregando...",
                search_org: "Buscar organização...",
                no_org_found: "Nenhuma organização encontrada.",
                your_orgs: "Suas organizações",
                no_workspaces: "Sem Workspaces",
                new_org: "Nova Organização",
                syncing: "Sincronizando...",
            },
            create_org: {
                title: "Nova Organização / Workspace",
                name_label: "Nome do Workspace",
                name_placeholder: "Ex: Minha Empresa, OrbitOS Hub...",
                name_help: "Este será o nome principal da sua organização no dashboard.",
                type_label: "Tipo de Comunidade",
                type_placeholder: "Selecione o tipo...",
                type_help: "Isso nos ajuda a personalizar os módulos recomendados para você.",
                success: "Organização criada com sucesso!",
                error: "Erro ao criar organização.",
                name_required: "O nome da organização é obrigatório.",
                cancel: "Cancelar",
                creating: "Criando...",
                button: "Criar Organização",
                types: {
                    game: "Gaming/Jogos",
                    music: "Música/Artistas",
                    study: "Estudos/Educação",
                    business: "Negócios/Empresas",
                    creator: "Criadores de Conteúdo",
                    dev: "Desenvolvedores/Tech",
                    general: "Geral/Misc",
                }
            },
        },
        common: {
            save: "Salvar",
            cancel: "Cancelar",
            edit: "Editar",
            delete: "Excluir",
            search: "Buscar",
            loading: "Carregando...",
            error: "Ocorreu um erro",
            success: "Sucesso!",
            actions: "Ações",
            status: "Status",
            name: "Nome",
            category: "Categoria",
            price: "Preço",
            description: "Descrição",
        },
        store: {
            title: "Loja Oficial",
            inventory_title: "Gestão de Inventário",
            inventory_desc: "Crie pacotes VIP, itens em jogo e assinaturas com entrega automatizada.",
            new_product: "Novo Produto",
            create_product_title: "Cadastrar Novo Produto",
            edit_product_title: "Editar Produto",
            product_name: "Nome do Produto",
            product_slug: "Slug (URL)",
            base_price: "Preço Base",
            billing_cycle: "Ciclo de Cobrança",
            delivery_driver: "Driver de Entrega",
            save_product: "Salvar Produto",
            one_time: "Pagamento Único",
            monthly: "Mensal",
            yearly: "Anual",
            manual_delivery: "Entrega Manual",
            auto_delivery: "Automático",
            no_products: "Nenhum produto encontrado",
            add_first_product: "Adicione seus primeiros itens para começar a vender.",
            view_in_store: "Ver na Loja",
            exclusive_feature: "Recurso Exclusivo",
            exclusive_desc: "A gestão avançada está disponível apenas nos planos PRO, ENTERPRISE e MAX.",
            overview: {
                total_revenue: "Receita Total",
                pending_orders: "Pedidos Pendentes",
                active_products: "Produtos Ativos",
                locked_store: "Módulo de Loja Bloqueado",
                locked_desc: "O Store Engine V1 está disponível apenas para assinantes do plano PRO, ENTERPRISE ou MAX. Faça o upgrade para começar a vender itens e VIPs de forma automatizada.",
                automation_title: "Automação e Entrega",
                automation_desc: "O OrbitOS entrega seus produtos automaticamente via Discord Bots ou Webhooks para o FiveM/Minecraft assim que o pagamento for aprovado. Certifique-se de configurar a entrega corretamente em cada produto.",
                bot_api_status: "Status da API do Bot",
                operational: "Operacional",
            },
            settings: {
                title: "Configurações da Loja",
                subtitle: "Gerencie gateways de pagamento, visibilidade pública e comportamento do checkout.",
                engine_status: "Estado da Store Engine",
                engine_status_desc: "Controle se a sua loja está pública para os jogadores.",
                currency: "Moeda Transacional",
                checkout_provider: "Provedor de Checkout",
                stripe_desc: "Checkout internacional seguro e recorrências nativas.",
                pix_desc: "Pagamento instantâneo via QR Code para o público brasileiro.",
                webhook_url: "URL de Webhook",
                copy_webhook: "Copie este URL para o Dashboard do seu provedor.",
            }
        },
        billing: {
            title: "Faturamento & Planos",
            current_plan: "Plano Atual",
            manage_subscription: "Gerenciar Assinatura",
            update_card: "Atualizar Card",
            usage_limits: "Limites de Uso",
            invoice_history: "Histórico de Faturas",
            choose_plan: "Escolha seu Plano",
            free_plan_desc: "Para começar e explorar a plataforma.",
            pro_plan_desc: "Para equipes que precisam de mais poder.",
            enterprise_plan_desc: "Para cidades e grandes comunidades.",
            max_plan_desc: "A experiência definitiva e suporte VIP.",
            upgrade_cta: "Fazer Upgrade",
            active_plan: "Plano Ativo",
            per_month: "mês",
            enterprise_upsell_title: "Escalabilidade Ilimitada com Enterprise",
            enterprise_upsell_desc: "Sua comunidade está crescendo? O plano Enterprise oferece suporte 24/7, SLA garantido, bots dedicados e integrações customizadas para grandes operações.",
            enterprise_upsell_button: "Conhecer Enterprise",
            upcoming_invoice: "Próxima Fatura",
            checkout_redirect: "Redirecionando para o checkout...",
            portal_redirect: "Abrindo portal do cliente...",
            success_msg: "Assinatura atualizada com sucesso!",
            success_desc: "As alterações podem levar alguns minutos para refletir no painel.",
            cancel_msg: "O processo de checkout foi cancelado.",
            cancel_desc: "Nenhuma cobrança foi realizada.",
            unlimited: "ilimitado",
            usage_servers: "Servidores Discord",
            usage_tickets: "Tickets Abertos (este mês)",
            invoice_id: "Fatura",
            invoice_date: "Data",
            invoice_plan: "Plano",
            invoice_amount: "Valor",
            invoice_status: "Status",
            invoice_action: "Ação",
            plans: {
                free: {
                    name: "Free",
                    description: "Para começar e explorar a plataforma.",
                    features: ["Até 3 servidores", "100 tickets/mês", "Analytics básico", "Suporte por e-mail"]
                },
                pro: {
                    name: "Pro",
                    description: "Para equipes que precisam de mais poder.",
                    features: ["Servidores ilimitados", "Tickets ilimitados", "Analytics avançado", "Multi-staff", "Webhooks Discord", "Suporte prioritário"]
                },
                enterprise: {
                    name: "Enterprise",
                    description: "Para grandes operações e corporações.",
                    features: ["Tudo do Pro", "SLA garantido 99.9%", "Gerente dedicado", "Integrações custom", "Deploy on-premise", "Suporte 24/7"]
                },
                max: {
                    name: "MAX",
                    description: "Poder total. Para os maiores do setor.",
                    features: ["Tudo do Enterprise", "Ilimitado em tudo", "URL personalizada", "Bot engine dedicado", "Foco em IA", "Suporte VIP 24/7"]
                }
            }
        },
        analytics: {
            active_servers: "Servidores Ativos",
            open_tickets: "Tickets Abertos",
            staff_online: "Staff Online",
            revenue_24h: "Receita (24h)",
            monthly_growth: "Crescimento Mensal",
            revenue_desc: "Volume de faturamento e ordens processadas.",
            audit_events: "Audit Events",
            infra_tracking: "Rastreamento de infraestrutura global.",
            view_audit_log: "Ver Log de Auditoria Completo",
            coming_soon: "Em breve: Log de Auditoria Completo",
            overview_title: "OVERVIEW_INFRA",
            revenue_data: "REVENUE_DATA",
            no_activity: "Nenhuma atividade registrada no log recente.",
            modified_by: "modificado por",
            version: "Versão OrbitOS",
            sla: "SLA Garantido",
            data_isolation: "Isolamento de Dados",
            conn_active: "CONEXÃO ATIVA COM O MOTOR DE INFRAESTRUTURA",
        },
        auth: {
            title: "Bem-vindo de volta",
            subtitle: "Conecte sua conta do Discord para continuar.",
            discord_btn: "Entrar com Discord",
            google_btn: "Entrar com Google",
            github_btn: "Entrar com GitHub",
            authenticating: "Autenticando...",
            info: "Informações",
            redirect_msg: "Você será redirecionado para o Discord para autenticar.",
            terms_msg: "Ao entrar, você concorda com nossos",
            terms_link: "Termos de Serviço",
            privacy_link: "Política de Privacidade",
            back_home: "Voltar para a página inicial",
            error_title: "Falha na autenticação",
            error_denied: "Você cancelou o acesso no Discord.",
            error_no_token: "O servidor não retornou o token.",
            error_generic: "Tente novamente. Se persistir, verifique as configurações do Discord App.",
            server_offline: "Servidor indisponível ou inacessível no momento.",
            professional_dashboard: "Dashboard Profissional",
        },
        docs: {
            title: "Referência da API",
            subtitle: "Documentação completa dos endpoints disponíveis para integração com o OrbitOS.",
            base_url: "Base URL",
            base_url_desc: "Todas as requisições são relativas a esta URL.",
            auth: "Autenticação",
            auth_desc: "Token JWT obtido via login Discord OAuth2.",
            rate_limits: "Rate Limits",
            rate_limit_global: "Global (por IP)",
            rate_limit_internal: "Rotas internas",
            plan_limits: "Limites por Plano",
            quick_ref: "Referência Rápida de Endpoints",
            usage_example: "Exemplo de Uso",
            interactive_swagger: "Swagger UI Interativo",
            interactive_swagger_desc: "Teste os endpoints diretamente no browser",
            openapi_spec: "OpenAPI JSON Spec",
            openapi_spec_desc: "Importe no Postman, Insomnia ou seu SDK favorito",
        },
        settings: {
            general: "Geral",
            language: "Idioma",
            save: "Salvar Alterações",
            success: "Configurações atualizadas com sucesso!",
            title: "Configurações do Sistema",
            subtitle: "Gerencie as preferências da sua conta e do sistema.",
            security: "Segurança",
            notifications: "Notificações",
            appearance: "Aparência",
            system_info: "Informações do Sistema",
            system_info_desc: "Configure o nome, a URL base e o idioma da sua plataforma.",
            org_name: "Nome da Organização",
            select_language: "Selecione um idioma",
            language_help: "Isso afetará as mensagens do bot no Discord e as interfaces públicas.",
            security_title: "Segurança e Autenticação",
            security_desc: "Gerencie chaves de API e métodos de login.",
            api_key: "Chave de API do Core",
            two_factor: "Autenticação de Dois Fatores",
            two_factor_desc: "Adicione uma camada extra de segurança.",
            two_factor_on: "2FA ativado",
            two_factor_off: "2FA desativado",
            reset_keys: "Resetar Chaves",
            update_security: "Atualizar Segurança",
            notifications_title: "Notificações",
            notifications_desc: "Escolha como você quer ser alertado sobre eventos importantes.",
            email_notif: "Notificações por E-mail",
            email_notif_desc: "Receba resumos semanais de analytics.",
            discord_notif: "Webhooks do Discord",
            discord_notif_desc: "Alertas de tickets críticos diretamente no seu canal.",
            appearance_white_label: "Customização do Portal (White-Label)",
            appearance_desc: "Configure temas, presets de layout, logos e CSS customizado para seu portal público e dashboard.",
            visual_identity: "Editor de Identidade Visual",
            visual_identity_desc: "Acesso a templates premium, aurora backgrounds e tipografia avançada.",
            open_editor: "Abrir Editor",
            panel_preferences: "Preferências do Painel",
            panel_preferences_desc: "Configurações rápidas de visualização local.",
            primary_color: "Cor Primária",
            high_contrast: "Modo de Alto Contraste",
            high_contrast_desc: "Melhora a legibilidade em ambientes claros.",
            slug: "Slug Exclusivo (URL)",
            slug_help: "O identificador único da sua comunidade dentro da plataforma.",
            subdomain: "Subdomínio OrbitOS",
            custom_domain: "Domínio Próprio",
            maintenance: "Manutenção Global",
            maintenance_desc: "Ative para desabilitar o acesso de todos os clientes temporariamente.",
            maintenance_on: "Modo manutenção ativado",
            maintenance_off: "Modo manutenção desativado",
            saving: "Salvando...",
        },
        automations: {
            onboarding: {
                how_it_works: "Como funciona",
                discord_example: "Exemplo no Discord",
                how_to_test: "Como testar",
                test_steps: "Passos para testar",
                ready_config: "Exemplo de Configuração Pronta",
                tips: "Boas práticas e limites",
            },
            modules: {
                ticket: {
                    subtitle: "Organize solicitações de ajuda dos jogadores em canais privados, com histórico e categoria.",
                    how_it_works: "O jogador clica no botão “📩 Abrir Ticket” em uma mensagem fixa no canal de suporte. O bot cria um canal privado, visível apenas para o jogador + equipe de staff. Quando o ticket é encerrado, o canal é arquivado ou apagado.",
                    test_steps: [
                        "Ative o módulo Tickets de Suporte no painel.",
                        "Configure o canal onde ficará a mensagem inicial e a categoria para os tickets.",
                        "No Discord, use o comando /painel ticket para gerar o botão.",
                        "Clique no botão 'Abrir Ticket' e verifique se o canal foi criado corretamente."
                    ]
                },
                whitelist: {
                    subtitle: "Filtra novos jogadores com perguntas pré-definidas antes de liberar acesso ao servidor.",
                    how_it_works: "Quando o jogador usar o comando /whitelist, o bot inicia o fluxo de perguntas. No final, o resultado é enviado para a staff para aprovação.",
                    test_steps: [
                        "Ative o módulo Whitelist no painel e configure o canal da staff.",
                        "No Discord, use o comando /whitelist como jogador.",
                        "Responda às perguntas e verifique se as respostas chegaram no canal da staff.",
                        "Teste a aprovação/reprovação manual (se configurado)."
                    ]
                },
                welcome_message: {
                    subtitle: "Crie uma primeira impressão marcante para novos jogadores.",
                    how_it_works: "O bot detecta quando alguém entra no servidor e envia uma mensagem personalizada no canal escolhido. Você pode usar variáveis como {user} para marcar a pessoa.",
                    test_steps: [
                        "Configure o canal de boas-vindas e a mensagem desejada.",
                        "Use o botão 'Testar' no painel (se disponível) ou convide uma conta secundária/amigo.",
                        "Verifique se o bot enviou a mensagem e se as variáveis foram substituídas corretamente."
                    ]
                },
                autorole: {
                    subtitle: "Automatize a entrega de cargos iniciais.",
                    how_it_works: "Assim que o jogador entra, o bot atribui os cargos selecionados instantaneamente, sem necessidade de comandos.",
                    test_steps: [
                        "Selecione os cargos que devem ser entregues.",
                        "Certifique-se de que o cargo do bot (OrbitOS) está ACIMA dos cargos que ele vai entregar no Discord.",
                        "Peça para alguém entrar no servidor e veja se o cargo foi atribuído em segundos."
                    ]
                },
                whitelist_quiz: {
                    subtitle: "Quiz automático para filtrar jogadores por conhecimento.",
                    how_it_works: "O jogador inicia o quiz via comando ou botão. Ele deve acertar uma porcentagem X de questões para ser aprovado e ganhar o cargo automaticamente.",
                    test_steps: [
                        "Crie as perguntas e defina as respostas corretas.",
                        "Configure a porcentagem mínima para passar.",
                        "No Discord, use /quiz para iniciar e tente responder como um jogador."
                    ]
                },
                server_status: {
                    subtitle: "Exiba estatísticas do servidor no nome dos canais.",
                    how_it_works: "O bot edita periodicamente o nome de canais de voz ou texto específicos para mostrar quantos membros online ou jogadores existem no momento.",
                    test_steps: [
                        "Crie um canal de voz limpo para servir de contador.",
                        "Configure o ID desse canal e o template (ex: 👥 {players} Jogadores).",
                        "Aguarde alguns minutos e veja o nome do canal atualizar automaticamente."
                    ]
                },
                coupon: {
                    subtitle: "Sistema de cupons para sua loja no servidor.",
                    how_it_works: "Crie códigos de desconto que podem ser aplicados em compras. Você define a porcentagem e se pode ser usado várias vezes.",
                    test_steps: [
                        "Crie um cupom de teste (ex: TESTE10) com 10% de desconto.",
                        "No sistema de loja, tente aplicar esse cupom no carrinho.",
                        "Verifique se o valor total foi reduzido corretamente."
                    ]
                },
                report: {
                    subtitle: "Centralize denúncias e sugestões de forma anônima ou não.",
                    how_it_works: "Membros abrem denúncias via comando. A staff recebe o alerta em um canal privado/log para análise.",
                    test_steps: [
                        "Defina o canal onde as denúncias serão recebidas.",
                        "Use o comando de denúncia no Discord.",
                        "Verifique se a staff recebeu o alerta com todos os detalhes."
                    ]
                },
                application: {
                    subtitle: "Formulários de recrutamento integrados ao Discord.",
                    how_it_works: "Crie perguntas personalizadas. O jogador responde via bot e a staff aprova ou reprova com um clique, entregando o cargo automaticamente.",
                    test_steps: [
                        "Configure as perguntas do formulário.",
                        "Tente preencher o formulário no Discord.",
                        "Como staff, aprove o teste e veja se o jogador recebeu o cargo configurado."
                    ]
                },
                level_system: {
                    subtitle: "Gamifique seu servidor com XP e níveis automáticos.",
                    how_it_works: "Membros ganham experiência (XP) ao enviar mensagens ou participar de calls. Ao atingir metas, eles sobem de nível e podem ganhar cargos automáticos.",
                    test_steps: [
                        "Configure o multiplicador de XP no painel.",
                        "No Discord, envie algumas mensagens e use o comando /rank.",
                        "Verifique se o bot exibe seu progresso corretamente."
                    ]
                },
                anti_raid: {
                    subtitle: "Proteção avançada contra bots e invasões.",
                    how_it_works: "O bot monitora entradas em massa ou comportamentos suspeitos e aplica punições automáticas (kick/ban) para proteger o servidor.",
                    test_steps: [
                        "Configure o limite de entradas por minuto.",
                        "O sistema trabalha silenciosamente. Verifique os logs de segurança para ver o bot em ação."
                    ]
                },
                suggestion: {
                    subtitle: "Sistema de sugestões com votação da comunidade.",
                    how_it_works: "Membros enviam sugestões via comando. A sugestão é enviada para um canal com reações de ✅ e ❌ para votação pública.",
                    test_steps: [
                        "Configure o canal de sugestões.",
                        "Use o comando de sugestão no Discord.",
                        "Verifique se a mensagem foi enviada com os botões/reações de voto."
                    ]
                },
                rules_accept: {
                    subtitle: "Obrigatório aceitar regras antes de ver o servidor.",
                    how_it_works: "O bot envia uma mensagem com as regras e um botão. O jogador só ganha acesso (cargo) após clicar em 'Aceitar'.",
                    test_steps: [
                        "Configure o cargo de membro e o canal das regras.",
                        "Use o comando para gerar a mensagem de regras.",
                        "Clique no botão de aceitar e verifique se o cargo foi entregue."
                    ]
                },
                verification: {
                    subtitle: "Sistema de verificação por captcha ou botão.",
                    how_it_works: "Protege o servidor de bots maliciosos exigindo que o usuário clique em um botão ou resolva um desafio simples ao entrar.",
                    test_steps: [
                        "Configure a mensagem de verificação.",
                        "Entre com uma conta de teste e clique no botão.",
                        "Verifique se o cargo de verificado foi atribuído."
                    ]
                },
                store_panel: {
                    subtitle: "Exiba os itens da sua loja diretamente no Discord.",
                    how_it_works: "Gera uma interface com selects e botões onde os jogadores podem navegar pelos produtos e iniciar compras sem sair do chat.",
                    test_steps: [
                        "Adicione produtos na sua aba de Loja.",
                        "No Discord, use o comando /loja.",
                        "Verifique se os produtos e preços aparecem corretamente."
                    ]
                },
                growth_stats: {
                    subtitle: "Análise de crescimento e novas entradas.",
                    how_it_works: "Métricas detalhadas sobre quantos membros entraram e saíram do servidor nos últimos dias.",
                    test_steps: ["Acesse a aba de Analytics para ver o gráfico atualizado."]
                },
                engagement_stats: {
                    subtitle: "Métricas de atividade e mensagens.",
                    how_it_works: "Saiba quais canais são mais usados e quais horários seus membros estão mais ativos.",
                    test_steps: ["Acesse a aba de Analytics para ver o ranking de canais."]
                },
                revenue_stats: {
                    subtitle: "Relatórios de vendas e faturamento.",
                    how_it_works: "Acompanhe suas vendas em tempo real com gráficos de faturamento diário, mensal e anual.",
                    test_steps: ["Confira o painel financeiro na aba de Analytics."]
                },
                activity_stats: {
                    subtitle: "Monitoramento de presença em voz e chat.",
                    how_it_works: "Relatórios sobre o tempo médio que os jogadores passam nos canais de voz.",
                    test_steps: ["Confira os dados de retenção na aba de Analytics."]
                },
                ranking: {
                    subtitle: "Exiba os melhores jogadores do seu servidor em tempo real.",
                    how_it_works: "O bot gera uma interface que lista os jogadores com mais XP, dinheiro ou vitórias. O ranking é atualizado automaticamente conforme as métricas mudam.",
                    test_steps: [
                        "Defina qual categoria de ranking deseja exibir.",
                        "No Discord, use o comando /ranking.",
                        "Verifique se a lista de líderes aparece com as fotos e dados corretos."
                    ]
                },
                giveaway: {
                    subtitle: "Crie sorteios com requisitos de cargos e tempo.",
                    how_it_works: "Gerencie sorteios de itens ou VIPs de forma automática. O bot sorteia o vencedor e valida se ele ainda está no servidor.",
                    test_steps: [
                        "Crie um sorteio de teste no Discord.",
                        "Peça para alguém participar.",
                        "Force o encerramento e veja se o bot anuncia o vencedor."
                    ]
                },
                faction_system: {
                    subtitle: "Gerenciamento completo para grupos e facções.",
                    how_it_works: "Permite criar grupos onde os jogadores podem se juntar. Inclui sistema de cargos internos, banco da facção e chat exclusivo entre membros.",
                    test_steps: [
                        "Crie uma facção de teste no painel.",
                        "Tente recrutar um membro usando o comando de facção.",
                        "Verifique se o novo membro ganhou acesso ao chat privado do grupo."
                    ]
                },
                judicial_system: {
                    subtitle: "Controle de processos internos e julgamentos.",
                    how_it_works: "Cria um fluxo para gestão de ocorrências, advogados e juízes dentro do servidor. Ideal para RP sério.",
                    test_steps: [
                        "Abra um processo de teste no painel judicial.",
                        "Atribua um advogado ao caso.",
                        "Verifique se o canal de tribunal foi criado automaticamente."
                    ]
                },
                in_game_logs: {
                    subtitle: "Sincronização de eventos do servidor de jogo.",
                    how_it_works: "Recebe logs diretamente do seu servidor (FiveM/Minecraft) e exibe em canais específicos do Discord.",
                    test_steps: [
                        "Configure o Webhook no seu servidor de jogo.",
                        "Realize uma ação in-game (ex: matar alguém).",
                        "Verifique se o log apareceu instantaneamente no Discord."
                    ]
                },
                anti_alt: {
                    subtitle: "Bloqueio automático de contas fakes e recentes.",
                    how_it_works: "Verifica a idade da conta do Discord e se possui avatar. Contas suspeitas são impedidas de entrar.",
                    test_steps: [
                        "Defina o limite de 30 dias para novas contas.",
                        "Tente entrar com uma conta criada hoje.",
                        "Verifique se o bot expulsou a conta e enviou o log."
                    ]
                },
                mod_logs: {
                    subtitle: "Histórico completo de punições e avisos.",
                    how_it_works: "Centraliza todas as ações de moderação (ban, kick, mute) em um canal secreto para auditoria.",
                    test_steps: [
                        "Aplique um aviso (warn) em um usuário de teste.",
                        "Verifique o canal de logs de moderação.",
                        "Confira se o motivo e o autor da punição estão corretos."
                    ]
                },
                conditional_workflow: {
                    subtitle: "Fluxos automatizados baseados em gatilhos e condições.",
                    how_it_works: "Você define uma regra (ex: se o jogador ganhar o cargo VIP) e uma ação (ex: enviar uma mensagem no privado).",
                    test_steps: [
                        "Crie uma regra de teste no painel.",
                        "Execute a ação de gatilho no Discord.",
                        "Verifique se a automação foi disparada."
                    ]
                },
                flash_sale: {
                    subtitle: "Crie ofertas de tempo limitado para sua loja.",
                    how_it_works: "Define um desconto agressivo por um curto período e notifica todos os membros interessados via menção.",
                    test_steps: [
                        "Abra uma nova oferta relâmpago.",
                        "Confira se a mensagem de anúncio foi enviada no canal configurado.",
                        "Verifique se o preço na loja foi atualizado automaticamente."
                    ]
                },
                staff_logs: {
                    subtitle: "Acompanhe as ações administrativas da sua equipe.",
                    how_it_works: "Registra quando um staff cria canais, altera cargos ou mexe em permissões sensíveis.",
                    test_steps: [
                        "Realize uma ação administrativa (ex: criar um novo canal).",
                        "Verifique se o log apareceu no canal secreto da staff."
                    ]
                },
                subscription: {
                    subtitle: "Gerencie planos mensais e cargos recorrentes.",
                    how_it_works: "Vincula cargos ao status de pagamento do usuário. Se a assinatura expira, o cargo é removido automaticamente.",
                    test_steps: [
                        "Vincule um cargo a um produto recorrente.",
                        "Simule um pagamento ou atribua manualmente na loja.",
                        "Verifique se o usuário recebeu o cargo após o processamento."
                    ]
                },
                poll: {
                    subtitle: "Crie enquetes interativas com votos ilimitados.",
                    how_it_works: "Gera uma interface com botões para os membros votarem. O resultado é exibido em tempo real ou após o encerramento.",
                    test_steps: [
                        "Use o comando /poll para criar uma enquete.",
                        "Vote usando os botões no Discord.",
                        "Verifique se a contagem foi atualizada corretamente."
                    ]
                },
                scheduled_messages: {
                    subtitle: "Agende anúncios e lembretes periódicos.",
                    how_it_works: "Você define o dia, hora e frequência das mensagens. O bot envia automaticamente no canal desejado.",
                    test_steps: [
                        "Agende uma mensagem para daqui a 5 minutos.",
                        "Aguarde no Discord e verifique o envio."
                    ]
                },
                trigger_system: {
                    subtitle: "Respostas automáticas para palavras-chave específicas.",
                    how_it_works: "O bot monitora o chat e responde com textos, imagens ou embeds quando alguém digita um termo configurado.",
                    test_steps: [
                        "Crie um gatilho para a palavra 'ajuda'.",
                        "Digite no chat e verifique se o bot respondeu."
                    ]
                },
                advanced_verification: {
                    subtitle: "Verificação segura via site ou redes sociais.",
                    how_it_works: "Exige que o usuário vincule uma conta externa (ex: GitHub, Steam) para provar sua identidade antes de entrar.",
                    test_steps: [
                        "Clique no botão de verificação avançada.",
                        "Complete o fluxo no navegador.",
                        "Verifique se o cargo foi liberado após o retorno."
                    ]
                },
                payment_logs: {
                    subtitle: "Log de vendas em tempo real para a staff.",
                    how_it_works: "Envia um alerta no canal escolhido sempre que um novo pagamento é aprovado ou uma assinatura é renovada.",
                    test_steps: [
                        "Realize uma compra de teste na loja.",
                        "Verifique se o log de pagamento apareceu no canal configurado."
                    ]
                }
            }
        }
    },
    'en-US': {
        landing: {
            nav: {
                ecosystem: "Ecosystem",
                infra: "Infrastructure",
                brandEngine: "Brand Engine",
                dashboard: "Dashboard",
            },
            hero: {
                badge: "OrbitOS V1.0 Launched",
                title1: "The operating system for",
                title2: "digital communities.",
                desc: "Multi-tenant infrastructure for Discord, games, and digital platforms. Full control, integrated monetization, and architecture ready to scale.",
                cta1: "Get Started for Free",
                cta2: "View Architecture",
                no_card: "No credit card required",
                setup_time: "Setup in 2 minutes",
                cancel_anytime: "Cancel anytime",
            },
            ecosystem: {
                badge: "Infinite Expandability",
                title: "One core. Multiple environments.",
                desc: "Discord is just the first module. We designed OrbitUp.io to be the central hub for your entire digital operation.",
                soon: "Coming Soon",
                discord_title: "Discord",
                discord_desc: "Complete server management, roles, tickets, and automations.",
                games_title: "Games",
                games_desc: "Native integration with FiveM, Minecraft, and Rust servers.",
                commerce_title: "Commerce",
                commerce_desc: "Own storefronts with high-conversion checkout.",
                api_title: "Integrated API",
                api_desc: "Control your operation via custom Webhooks.",
            },
            infra: {
                badge: "High-Level Architecture",
                title1: "Architecture built to",
                title2: "scale.",
                desc: "OrbitUp.io runs silently on a robust enterprise-grade stack. Its core isolates operations, routes secure traffic, and audits every step of your users.",
                multi_tenant_title: "PostgreSQL Multi-Tenant",
                multi_tenant_desc: "Data isolation per organization.",
                websocket_title: "Authenticated WebSocket",
                websocket_desc: "Secured heartbeats and events.",
                stripe_title: "Stripe Webhooks V2",
                stripe_desc: "Encrypted subscriptions checkout.",
                audit_title: "Audit & Moderation Logs",
                audit_desc: "100% action traceability.",
            },
            brand: {
                badge: "Orbit Brand Engine",
                title1: "Your community.",
                title2: "Your brand.",
                desc: "OrbitUp.io has native White-Label. With the integrated Brand Engine, you implement stunning visual identities and isolated color tokens in less than a click.",
            },
            audience: {
                title: "Built for digital leaders.",
                creators_title: "Creators",
                creators_desc: "Monetize your audience with recurring plans and gated VIP content.",
                owners_title: "Server Owners",
                owners_desc: "Automate moderation and support to focus on community engagement.",
                enterprise_title: "Companies",
                enterprise_desc: "Provide B2B white-label support with guaranteed SLA history and tickets.",
                devs_title: "Developers",
                devs_desc: "A robust foundation so you can stop re-writing auth systems.",
            },
            comparison: {
                title: "Why not use common bots?",
                desc: "The difference between running a hobby and scaling a business on Discord.",
                bad_title: "Common Bots",
                good_title: "OrbitUp.io",
                row1: "Single server architecture",
                row2: "Stiff design for FREE plan",
                row3: "No audit records (Logs)",
                row4: "Zero Stripe / Monetization control",
                row5: "Limited permissions (Everyone is Admin)",
                row1_good: "Multi-tenant isolated by organization",
                row2_good: "White Label Template Engine",
                row3_good: "Full and traceable Audit Logs",
                row4_good: "Native Stripe Webhooks & Gating",
                row5_good: "Role-Based Access Control (RBAC)",
            },
            cta_final: {
                title: "Ready to take control of your digital ecosystem?",
                desc: "Build your global infrastructure today and stop managing your community as a weekend hobby.",
                button: "Create Free Account",
            },
            footer: {
                terms: "Terms",
                privacy: "Privacy",
                copyright: "Operating System for Digital Communities.",
            },
            common: {
                loading: "Loading...",
                error: "An error occurred",
                success: "Success",
                status: "Status",
                show: "Show",
                hide: "Hide",
                saving: "Saving...",
                coming_soon: "Coming soon",
            }
        },
        dashboard: {
            sidebar: {
                menu: "Main Menu",
                system: "System",
                analytics: "Analytics",
                automations: "Automations",
                automation_builder: "⚡ Automation Builder",
                servers: "Servers",
                tickets: "Tickets",
                staff: "Staff",
                store: "VIP Store",
                billing: "Billing",
                api_docs: "API Docs",
                settings: "Settings",
                platform: "Administration",
                profile: "My Profile",
                view_profile: "View profile",
                logout: "Log out",
                exit_support: "End Support",
            },
            bread: {
                overview: "Overview",
                servers: "Servers",
                tickets: "Tickets",
                staff: "Staff",
                analytics: "Analytics",
                billing: "Billing",
                settings: "Settings",
                platform: "Platform",
                organizations: "Organizations",
            },
            header: {
                servers_growth: "+12 SERVERS THIS WEEK",
                loading: "Loading...",
                search_org: "Search organization...",
                no_org_found: "No organization found.",
                your_orgs: "Your organizations",
                no_workspaces: "No Workspaces",
                new_org: "New Organization",
                syncing: "Syncing...",
            },
            create_org: {
                title: "New Organization / Workspace",
                name_label: "Workspace Name",
                name_placeholder: "Ex: My Company, OrbitOS Hub...",
                name_help: "This will be the main name of your organization in the dashboard.",
                type_label: "Community Type",
                type_placeholder: "Select type...",
                type_help: "This helps us personalize recommended modules for you.",
                success: "Organization created successfully!",
                error: "Error creating organization.",
                name_required: "Organization name is required.",
                cancel: "Cancel",
                creating: "Creating...",
                button: "Create Organization",
                types: {
                    game: "Gaming/Games",
                    music: "Music/Artists",
                    study: "Studies/Education",
                    business: "Business/Companies",
                    creator: "Content Creators",
                    dev: "Developers/Tech",
                    general: "General/Misc",
                }
            },
        },
        common: {
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            search: "Search",
            loading: "Loading...",
            error: "An error occurred",
            success: "Success!",
            actions: "Actions",
            status: "Status",
            name: "Name",
            category: "Category",
            price: "Price",
            description: "Description",
        },
        store: {
            title: "Official Store",
            inventory_title: "Inventory Management",
            inventory_desc: "Create VIP packs, in-game items, and subscriptions with automated delivery.",
            new_product: "New Product",
            create_product_title: "Register New Product",
            edit_product_title: "Edit Product",
            product_name: "Product Name",
            product_slug: "Slug (URL)",
            base_price: "Base Price",
            billing_cycle: "Billing Cycle",
            delivery_driver: "Delivery Driver",
            save_product: "Save Product",
            one_time: "One-time Payment",
            monthly: "Monthly",
            yearly: "Yearly",
            manual_delivery: "Manual Delivery",
            auto_delivery: "Automatic",
            no_products: "No products found",
            add_first_product: "Add your first items to start selling.",
            view_in_store: "View in Store",
            exclusive_feature: "Exclusive Feature",
            exclusive_desc: "Advanced management is only available in PRO, ENTERPRISE, and MAX plans.",
            overview: {
                total_revenue: "Total Revenue",
                pending_orders: "Pending Orders",
                active_products: "Active Products",
                locked_store: "Store Module Locked",
                locked_desc: "Store Engine V1 is only available for PRO, ENTERPRISE, or MAX subscribers. Upgrade to start selling items and VIPs automatically.",
                automation_title: "Automation & Delivery",
                automation_desc: "OrbitOS delivers your products automatically via Discord Bots or Webhooks for FiveM/Minecraft as soon as payment is approved. Make sure to configure delivery correctly in each product.",
                bot_api_status: "Bot API Status",
                operational: "Operational",
            },
            settings: {
                title: "Store Settings",
                subtitle: "Manage payment gateways, public visibility, and checkout behavior.",
                engine_status: "Store Engine Status",
                engine_status_desc: "Control if your store is public for gamers.",
                currency: "Transactional Currency",
                checkout_provider: "Checkout Provider",
                stripe_desc: "Secure international checkout and native recurring billing.",
                pix_desc: "Instant payment via QR Code for the Brazilian audience.",
                webhook_url: "Webhook URL",
                copy_webhook: "Copy this URL to your provider's Dashboard.",
            }
        },
        billing: {
            title: "Billing & Plans",
            current_plan: "Current Plan",
            manage_subscription: "Manage Subscription",
            update_card: "Update Card",
            usage_limits: "Usage Limits",
            invoice_history: "Invoice History",
            choose_plan: "Choose your Plan",
            free_plan_desc: "To start and explore the platform.",
            pro_plan_desc: "For teams that need more power.",
            enterprise_plan_desc: "For growing communities.",
            max_plan_desc: "The ultimate experience and VIP support.",
            upgrade_cta: "Upgrade",
            active_plan: "Active Plan",
            per_month: "month",
            enterprise_upsell_title: "Unlimited Scalability with Enterprise",
            enterprise_upsell_desc: "Is your community growing? The Enterprise plan offers 24/7 support, guaranteed SLA, dedicated bots, and custom integrations for large operations.",
            enterprise_upsell_button: "Explore Enterprise",
            upcoming_invoice: "Upcoming Invoice",
            checkout_redirect: "Redirecting to checkout...",
            portal_redirect: "Opening customer portal...",
            success_msg: "Subscription updated successfully!",
            success_desc: "Changes may take a few minutes to reflect in the dashboard.",
            cancel_msg: "Checkout process was canceled.",
            cancel_desc: "No charges were made.",
            unlimited: "unlimited",
            usage_servers: "Discord Servers",
            usage_tickets: "Open Tickets (this month)",
            invoice_id: "Invoice",
            invoice_date: "Date",
            invoice_plan: "Plan",
            invoice_amount: "Amount",
            invoice_status: "Status",
            invoice_action: "Action",
            plans: {
                free: {
                    name: "Free",
                    description: "To start and explore the platform.",
                    features: ["Up to 3 servers", "100 tickets/month", "Basic analytics", "Email support"]
                },
                pro: {
                    name: "Pro",
                    description: "For teams that need more power.",
                    features: ["Unlimited servers", "Unlimited tickets", "Advanced analytics", "Multi-staff", "Discord webhooks", "Priority support"]
                },
                enterprise: {
                    name: "Enterprise",
                    description: "For large operations and corporations.",
                    features: ["All from Pro", "99.9% SLA", "Dedicated manager", "Custom integrations", "On-premise deploy", "24/7 support"]
                },
                max: {
                    name: "MAX",
                    description: "Total power. For the industry leaders.",
                    features: ["All from Enterprise", "Unlimited everything", "Custom URL", "Dedicated bot engine", "AI focus", "VIP 24/7 support"]
                }
            }
        },
        analytics: {
            active_servers: "Active Servers",
            open_tickets: "Open Tickets",
            staff_online: "Staff Online",
            revenue_24h: "Revenue (24h)",
            monthly_growth: "Monthly Growth",
            revenue_desc: "Billing volume and processed orders.",
            audit_events: "Audit Events",
            infra_tracking: "Global infrastructure tracking.",
            view_audit_log: "View Full Audit Log",
            coming_soon: "Coming Soon: Full Audit Log",
            overview_title: "INFRA_OVERVIEW",
            revenue_data: "REVENUE_DATA",
            no_activity: "No activity recorded in recent log.",
            modified_by: "modified by",
            version: "OrbitOS Version",
            sla: "Guaranteed SLA",
            data_isolation: "Data Isolation",
            conn_active: "ACTIVE CONNECTION TO INFRASTRUCTURE ENGINE",
        },
        auth: {
            title: "Welcome back",
            subtitle: "Connect your Discord account to continue.",
            discord_btn: "Sign in with Discord",
            google_btn: "Sign in with Google",
            github_btn: "Sign in with GitHub",
            authenticating: "Authenticating...",
            info: "Information",
            redirect_msg: "You will be redirected to Discord to authenticate.",
            terms_msg: "By joining, you agree to our",
            terms_link: "Terms of Service",
            privacy_link: "Privacy Policy",
            back_home: "Back to home page",
            error_title: "Authentication failed",
            error_denied: "You cancelled the access on Discord.",
            error_no_token: "The server did not return a token.",
            error_generic: "Try again. If it persists, check your Discord App settings.",
            server_offline: "Server unavailable or inaccessible at the moment.",
            professional_dashboard: "Professional Dashboard",
        },
        docs: {
            title: "API Reference",
            subtitle: "Complete documentation of the available endpoints for OrbitOS integration.",
            base_url: "Base URL",
            base_url_desc: "All requests are relative to this URL.",
            auth: "Authentication",
            auth_desc: "JWT Token obtained via Discord OAuth2 login.",
            rate_limits: "Rate Limits",
            rate_limit_global: "Global (per IP)",
            rate_limit_internal: "Internal routes",
            plan_limits: "Limits per Plan",
            quick_ref: "Endpoint Quick Reference",
            usage_example: "Usage Example",
            interactive_swagger: "Interactive Swagger UI",
            interactive_swagger_desc: "Test endpoints directly in the browser",
            openapi_spec: "OpenAPI JSON Spec",
            openapi_spec_desc: "Import into Postman, Insomnia, or your favorite SDK",
        },
        settings: {
            general: "General",
            language: "Language",
            save: "Save Changes",
            success: "Settings updated successfully!",
            title: "System Settings",
            subtitle: "Manage your account and system preferences.",
            security: "Security",
            notifications: "Notifications",
            appearance: "Appearance",
            system_info: "System Information",
            system_info_desc: "Configure the name, base URL, and language of your platform.",
            org_name: "Organization Name",
            select_language: "Select a language",
            language_help: "This will affect bot messages on Discord and public interfaces.",
            security_title: "Security & Authentication",
            security_desc: "Manage API keys and login methods.",
            api_key: "Core API Key",
            two_factor: "Two-Factor Authentication",
            two_factor_desc: "Add an extra layer of security.",
            two_factor_on: "2FA enabled",
            two_factor_off: "2FA disabled",
            reset_keys: "Reset Keys",
            update_security: "Update Security",
            notifications_title: "Notifications",
            notifications_desc: "Choose how you want to be alerted about important events.",
            email_notif: "Email Notifications",
            email_notif_desc: "Receive weekly analytics summaries.",
            discord_notif: "Discord Webhooks",
            discord_notif_desc: "Critical ticket alerts directly in your channel.",
            appearance_white_label: "Portal Customization (White-Label)",
            appearance_desc: "Configure themes, layout presets, logos, and custom CSS for your public portal and dashboard.",
            visual_identity: "Visual Identity Editor",
            visual_identity_desc: "Access to premium templates, aurora backgrounds, and advanced typography.",
            open_editor: "Open Editor",
            panel_preferences: "Panel Preferences",
            panel_preferences_desc: "Quick local view settings.",
            primary_color: "Primary Color",
            high_contrast: "High Contrast Mode",
            high_contrast_desc: "Improves readability in light environments.",
            slug: "Unique Slug (URL)",
            slug_help: "The unique identifier for your community on the platform.",
            subdomain: "OrbitOS Subdomain",
            custom_domain: "Custom Domain",
            maintenance: "Global Maintenance",
            maintenance_desc: "Enable to temporarily disable access for all clients.",
            maintenance_on: "Maintenance mode enabled",
            maintenance_off: "Maintenance mode disabled",
            saving: "Saving...",
        },
        automations: {
            onboarding: {
                how_it_works: "How it works",
                discord_example: "Discord Example",
                how_to_test: "How to test",
                test_steps: "Test steps",
                ready_config: "Ready-to-use Config",
                tips: "Best practices & limits",
            },
            modules: {
                ticket: {
                    subtitle: "Organize player help requests in private channels, with history and categories.",
                    how_it_works: "The player clicks the '📩 Open Ticket' button in a fixed message. The bot creates a private channel visible only to the player + staff team.",
                    test_steps: [
                        "Enable the Support Tickets module in the panel.",
                        "Configure the channel for the initial message and the ticket category.",
                        "On Discord, use /painel ticket to generate the button.",
                        "Click 'Open Ticket' and verify the channel creation."
                    ]
                },
                whitelist: {
                    subtitle: "Filters new players with pre-defined questions before granting server access.",
                    how_it_works: "When a player uses /whitelist, the bot starts the question flow. The final result is sent to staff for approval.",
                    test_steps: [
                        "Enable the Whitelist module and configure the staff channel.",
                        "On Discord, use /whitelist as a player.",
                        "Answer the questions and verify staff receipt.",
                        "Test manual approval/rejection (if configured)."
                    ]
                },
                welcome_message: {
                    subtitle: "Create a memorable first impression for new players.",
                    how_it_works: "The bot detects when someone joins the server and sends a custom message to the chosen channel. You can use variables like {user} to mention the person.",
                    test_steps: [
                        "Configure the welcome channel and your desired message.",
                        "Use the 'Test' button in the panel (if available) or invite a second account/friend.",
                        "Check if the bot sent the message and if variables were correctly replaced."
                    ]
                },
                autorole: {
                    subtitle: "Automate initial role assignment.",
                    how_it_works: "As soon as a player joins, the bot instantly assigns the selected roles, no commands needed.",
                    test_steps: [
                        "Select the roles to be assigned.",
                        "Ensure the bot's role (OrbitOS) is ABOVE the roles it will assign in Discord settings.",
                        "Have someone join the server and check if the role was assigned within seconds."
                    ]
                },
                whitelist_quiz: {
                    subtitle: "Automatic quiz to filter players by knowledge.",
                    how_it_works: "The player starts the quiz via command or button. They must answer X% of questions correctly to pass and get the role automatically.",
                    test_steps: [
                        "Create the questions and define correct answers.",
                        "Set the minimum passing percentage.",
                        "On Discord, use /quiz to start and try answering as a player."
                    ]
                },
                server_status: {
                    subtitle: "Display server statistics in channel names.",
                    how_it_works: "The bot periodically updates the names of specific channels to show real-time member or player counts.",
                    test_steps: [
                        "Create a voice channel to act as a counter.",
                        "Configure the channel ID and template (e.g., 👥 {players} Players).",
                        "Wait a few minutes and watch the channel name update automatically."
                    ]
                },
                coupon: {
                    subtitle: "Coupon system for your server store.",
                    how_it_works: "Create discount codes for purchases. You define the percentage and usage limits.",
                    test_steps: [
                        "Create a test coupon (e.g., TEST10) with 10% discount.",
                        "In the store system, try applying this coupon at checkout.",
                        "Check if the total price was correctly reduced."
                    ]
                },
                report: {
                    subtitle: "Centralize reports and suggestions, anonymous or not.",
                    how_it_works: "Members submit reports via command. Staff receives alerts in a private channel for review.",
                    test_steps: [
                        "Set the channel for receiving reports.",
                        "Use the report command on Discord.",
                        "Check if staff received the alert with all details."
                    ]
                },
                application: {
                    subtitle: "Recruitment forms integrated with Discord.",
                    how_it_works: "Create custom questions. Players answer via bot, and staff can approve/deny with one click.",
                    test_steps: [
                        "Configure your application questions.",
                        "Try completing the form on Discord.",
                        "As staff, approve the test and check if the player received the configured role."
                    ]
                },
                level_system: {
                    subtitle: "Gamify your server with XP and automatic levels.",
                    how_it_works: "Members earn experience (XP) by sending messages or participating in voice calls. Reaching milestones levels them up and grants automatic roles.",
                    test_steps: [
                        "Configure the XP multiplier in the panel.",
                        "On Discord, send a few messages and use the /rank command.",
                        "Verify that the bot displays your progress correctly."
                    ]
                },
                anti_raid: {
                    subtitle: "Advanced protection against bots and raids.",
                    how_it_works: "The bot monitors mass joins or suspicious behavior and applies automatic punishments (kick/ban) to protect the server.",
                    test_steps: [
                        "Configure the joins-per-minute limit.",
                        "The system works silently. Check security logs to see the bot in action."
                    ]
                },
                suggestion: {
                    subtitle: "Suggestion system with community voting.",
                    how_it_works: "Members submit suggestions via command. The suggestion is sent to a channel with ✅ and ❌ reactions for public voting.",
                    test_steps: [
                        "Configure the suggestions channel.",
                        "Use the suggestion command on Discord.",
                        "Verify the message was sent with voting buttons/reactions."
                    ]
                },
                rules_accept: {
                    subtitle: "Mandatory rules acceptance before seeing the server.",
                    how_it_works: "The bot sends a message with rules and a button. Players gain access (role) only after clicking 'Accept'.",
                    test_steps: [
                        "Configure the member role and rules channel.",
                        "Use the command to generate the rules message.",
                        "Click the accept button and verify the role was granted."
                    ]
                },
                verification: {
                    subtitle: "Verification system via captcha or button.",
                    how_it_works: "Protects the server from malicious bots by requiring users to click a button or solve a simple challenge upon joining.",
                    test_steps: [
                        "Configure the verification message.",
                        "Join with a test account and click the button.",
                        "Verify the verified role was assigned."
                    ]
                },
                store_panel: {
                    subtitle: "Display your store items directly on Discord.",
                    how_it_works: "Generates an interface with selects and buttons where players can browse products and start purchases without leaving chat.",
                    test_steps: [
                        "Add products in your Store tab.",
                        "On Discord, use the /store command.",
                        "Verify products and prices appear correctly."
                    ]
                },
                growth_stats: {
                    subtitle: "Analysis of growth and new joins.",
                    how_it_works: "Detailed metrics on how many members joined and left the server in recent days.",
                    test_steps: ["Access the Analytics tab to see the updated chart."]
                },
                engagement_stats: {
                    subtitle: "Activity and message metrics.",
                    how_it_works: "Find out which channels are most used and what times your members are most active.",
                    test_steps: ["Access the Analytics tab to see the channel ranking."]
                },
                revenue_stats: {
                    subtitle: "Sales and revenue reports.",
                    how_it_works: "Track your sales in real-time with daily, monthly, and yearly revenue charts.",
                    test_steps: ["Check the financial dashboard in the Analytics tab."]
                },
                activity_stats: {
                    subtitle: "Voice and chat presence monitoring.",
                    how_it_works: "Reports on the average time players spend in voice channels.",
                    test_steps: ["Check retention data in the Analytics tab."]
                },
                ranking: {
                    subtitle: "Display the top players of your server in real-time.",
                    how_it_works: "The bot generates an interface listing players with the most XP, money, or wins. The ranking updates automatically as metrics change.",
                    test_steps: [
                        "Define which ranking category you want to display.",
                        "On Discord, use the /ranking command.",
                        "Verify that the leaderboard appears with correct photos and data."
                    ]
                },
                giveaway: {
                    subtitle: "Create giveaways with role and time requirements.",
                    how_it_works: "Manage giveaways for items or VIPs automatically. The bot picks the winner and validates if they are still on the server.",
                    test_steps: [
                        "Create a test giveaway on Discord.",
                        "Ask someone to join.",
                        "Force end and see if the bot announces the winner."
                    ]
                },
                faction_system: {
                    subtitle: "Complete management for groups and factions.",
                    how_it_works: "Allows creating groups for players to join. Includes internal roles, faction bank, and exclusive member chat.",
                    test_steps: [
                        "Create a test faction in the panel.",
                        "Try recruiting a member using the faction command.",
                        "Check if the new member gained access to the private group chat."
                    ]
                },
                judicial_system: {
                    subtitle: "Control of internal processes and trials.",
                    how_it_works: "Creates a workflow for managing occurrences, lawyers, and judges within the server. Ideal for serious RP.",
                    test_steps: [
                        "Open a test case in the judicial panel.",
                        "Assign a lawyer to the case.",
                        "Check if the courtroom channel was created automatically."
                    ]
                },
                in_game_logs: {
                    subtitle: "Synchronization of game server events.",
                    how_it_works: "Receives logs directly from your server (FiveM/Minecraft) and displays them in specific Discord channels.",
                    test_steps: [
                        "Configure the Webhook on your game server.",
                        "Perform an in-game action (e.g., kill someone).",
                        "Verify that the log appeared instantly on Discord."
                    ]
                },
                anti_alt: {
                    subtitle: "Automatic blocking of fake and recent accounts.",
                    how_it_works: "Checks Discord account age and avatar availability. Suspicious accounts are prevented from joining.",
                    test_steps: [
                        "Set a 30-day limit for new accounts.",
                        "Try to join with an account created today.",
                        "Verify if the bot kicked the account and sent the log."
                    ]
                },
                mod_logs: {
                    subtitle: "Complete history of punishments and warnings.",
                    how_it_works: "Centralizes all moderation actions (ban, kick, mute) in a secret channel for auditing.",
                    test_steps: [
                        "Apply a warning (warn) to a test user.",
                        "Check the moderation logs channel.",
                        "Verify if the reason and the author of the punishment are correct."
                    ]
                },
                conditional_workflow: {
                    subtitle: "Automated workflows based on triggers and conditions.",
                    how_it_works: "You define a rule (e.g., if the player gets the VIP role) and an action (e.g., send a DM).",
                    test_steps: [
                        "Create a test rule in the panel.",
                        "Execute the trigger action on Discord.",
                        "Verify if the automation was triggered."
                    ]
                },
                flash_sale: {
                    subtitle: "Create limited-time offers for your store.",
                    how_it_works: "Sets an aggressive discount for a short period and notifies interested members via mention.",
                    test_steps: [
                        "Open a new flash sale.",
                        "Check if the announcement message was sent in the configured channel.",
                        "Verify if the store price was updated automatically."
                    ]
                },
                staff_logs: {
                    subtitle: "Track your team's administrative actions.",
                    how_it_works: "Records when a staff member creates channels, changes roles, or edits sensitive permissions.",
                    test_steps: [
                        "Perform an administrative action (e.g., create a new channel).",
                        "Verify if the log appeared in the secret staff channel."
                    ]
                },
                subscription: {
                    subtitle: "Manage monthly plans and recurring roles.",
                    how_it_works: "Links roles to the user's payment status. If the subscription expires, the role is automatically removed.",
                    test_steps: [
                        "Link a role to a recurring product.",
                        "Simulate a payment or manually assign it in the store.",
                        "Verify if the user received the role after processing."
                    ]
                },
                poll: {
                    subtitle: "Create interactive polls with unlimited votes.",
                    how_it_works: "Generates an interface with buttons for members to vote. Results are displayed in real-time or after closing.",
                    test_steps: [
                        "Use the /poll command to create a poll.",
                        "Vote using the buttons on Discord.",
                        "Verify if the count was updated correctly."
                    ]
                },
                scheduled_messages: {
                    subtitle: "Schedule periodic announcements and reminders.",
                    how_it_works: "You define the day, time, and frequency of messages. The bot sends them automatically in the desired channel.",
                    test_steps: [
                        "Schedule a message for 5 minutes from now.",
                        "Wait on Discord and verify the delivery."
                    ]
                },
                trigger_system: {
                    subtitle: "Automatic responses to specific keywords.",
                    how_it_works: "The bot monitors chat and responds with texts, images, or embeds when someone types a configured term.",
                    test_steps: [
                        "Create a trigger for the word 'help'.",
                        "Type in chat and verify if the bot responded."
                    ]
                },
                advanced_verification: {
                    subtitle: "Secure verification via website or social media.",
                    how_it_works: "Requires the user to link an external account (e.g., GitHub, Steam) to prove their identity before joining.",
                    test_steps: [
                        "Click the advanced verification button.",
                        "Complete the flow in the browser.",
                        "Verify if the role was granted after returning."
                    ]
                },
                payment_logs: {
                    subtitle: "Real-time sales logs for staff.",
                    how_it_works: "Sends an alert in the chosen channel whenever a new payment is approved or a subscription is renewed.",
                    test_steps: [
                        "Perform a test purchase in the store.",
                        "Verify if the payment log appeared in the configured channel."
                    ]
                }
            }
        }
    },
    'es-ES': {
        landing: {
            nav: {
                ecosystem: "Ecosistema",
                infra: "Infraestructura",
                brandEngine: "Brand Engine",
                dashboard: "Dashboard",
            },
            hero: {
                badge: "OrbitOS V1.0 Lanzado",
                title1: "El sistema operativo para",
                title2: "comunidades digitales.",
                desc: "Infraestructura multi-tenant para Discord, juegos e plataformas digitales. Control total, monetización integrada y arquitectura lista para escalar.",
                cta1: "Empezar Gratis",
                cta2: "Ver Arquitectura",
                no_card: "Sin tarjeta de crédito",
                setup_time: "Configuración en 2 minutos",
                cancel_anytime: "Cancela en cualquier momento",
            },
            ecosystem: {
                badge: "Expansibilidad Infinita",
                title: "Un núcleo. Múltiplos entornos.",
                desc: "Discord es solo el primer módulo. Diseñamos OrbitUp.io para ser el centro de toda su operación digital.",
                soon: "Próximamente",
                discord_title: "Discord",
                discord_desc: "Gestión completa de servidores, roles, tickets y automatizaciones.",
                games_title: "Juegos",
                games_desc: "Integración nativa con servidores FiveM, Minecraft y Rust.",
                commerce_title: "Comercio",
                commerce_desc: "Tiendas propias con checkout de alta conversión.",
                api_title: "API Integrada",
                api_desc: "Controle su operación vía Webhooks personalizados.",
            },
            infra: {
                badge: "Arquitectura de Alto Nivel",
                title1: "Arquitectura construida para",
                title2: "escalar.",
                desc: "OrbitUp.io funciona silenciosamente sobre una base técnica robusta de nivel empresarial. Su núcleo aísla operaciones, enruta tráfico seguro y audita cada paso de sus usuarios.",
                multi_tenant_title: "PostgreSQL Multi-Tenant",
                multi_tenant_desc: "Aislamiento de datos por organización.",
                websocket_title: "WebSocket Autenticado",
                websocket_desc: "Heartbeats y eventos securizados.",
                stripe_title: "Stripe Webhooks V2",
                stripe_desc: "Suscripciones encriptadas checkout.",
                audit_title: "Audit & Moderation Logs",
                audit_desc: "Trazabilidad del 100% de las acciones.",
            },
            brand: {
                badge: "Orbit Brand Engine",
                title1: "Su comunidad.",
                title2: "Su marca.",
                desc: "OrbitUp.io posee un White-Label nativo. Con el Brand Engine integrado, implementas identidades visuales impresionantes y tokens de color aislados en menos de un clic.",
            },
            audience: {
                title: "Construido para líderes digitales.",
                creators_title: "Creadores",
                creators_desc: "Monetiza tu audiencia con planes recurrentes y contenido VIP restringido.",
                owners_title: "Dueños de Servidores",
                owners_desc: "Automatiza la moderación y soporte para enfocarte en el compromiso de la comunidad.",
                enterprise_title: "Empresas",
                enterprise_desc: "Proporciona soporte B2B white-label con historial de SLA garantizado y tickets.",
                devs_title: "Desarrolladores",
                devs_desc: "Una base robusta para que dejes de re-escribir sistemas de autenticación.",
            },
            comparison: {
                title: "¿Por qué no usar bots comunes?",
                desc: "La diferencia entre dirigir un hobby y escalar un negocio en Discord.",
                bad_title: "Bots Comunes",
                good_title: "OrbitUp.io",
                row1: "Arquitectura de servidor único",
                row2: "Diseño rígido para el plan GRATUITO",
                row3: "Sin registros de auditoria (Logs)",
                row4: "Cero control de Stripe / Monetización",
                row5: "Permisos limitados (Todos son Admin)",
                row1_good: "Multi-tenant aislado por organización",
                row2_good: "Motor de Plantillas White Label",
                row3_good: "Audit Logs completos y trazables",
                row4_good: "Stripe Webhooks & Gating 100% nativo",
                row5_good: "Role-Based Access Control (RBAC)",
            },
            cta_final: {
                title: "¿Listo para tomar el control de su ecosistema digital?",
                desc: "Construya su infraestructura global hoy y deje de administrar su comunidad como un hobby de fin de semana.",
                button: "Crear Cuenta Gratis",
            },
            footer: {
                terms: "Términos",
                privacy: "Privacidad",
                copyright: "Sistema Operativo para Comunidades Digitales.",
            }
        },
        dashboard: {
            sidebar: {
                menu: "Menú Principal",
                system: "Sistema",
                analytics: "Analítica",
                automations: "Automatizaciones",
                automation_builder: "⚡ Constructor de Auto.",
                servers: "Servidores",
                tickets: "Tickets",
                staff: "Staff",
                store: "Tienda VIP",
                billing: "Facturación",
                api_docs: "Docs de API",
                settings: "Configuración",
                platform: "Administración",
                profile: "Mi Perfil",
                view_profile: "Ver perfil",
                logout: "Cerrar sesión",
                exit_support: "Finalizar Soporte",
            },
            bread: {
                overview: "Resumen",
                servers: "Servidores",
                tickets: "Tickets",
                staff: "Staff",
                analytics: "Analítica",
                billing: "Facturación",
                settings: "Configuración",
                platform: "Plataforma",
                organizations: "Organizaciones",
            },
            header: {
                servers_growth: "+12 SERVIDORES ESTA SEMANA",
                loading: "Cargando...",
                search_org: "Buscar organización...",
                no_org_found: "No se encontró ninguna organización.",
                your_orgs: "Sus organizaciones",
                no_workspaces: "Sin Workspaces",
                new_org: "Nueva Organización",
                syncing: "Sincronizando...",
            },
            create_org: {
                title: "Nueva Organización / Espacio de Trabajo",
                name_label: "Nombre del Espacio de Trabajo",
                name_placeholder: "Ej: Mi Empresa, OrbitOS Hub...",
                name_help: "Este será el nombre principal de su organización en el panel.",
                type_label: "Tipo de Comunidad",
                type_placeholder: "Seleccione tipo...",
                type_help: "Esto nos ayuda a personalizar los módulos recomendados para usted.",
                success: "¡Organización creada con éxito!",
                error: "Error al crear la organización.",
                name_required: "El nombre de la organización es obligatorio.",
                cancel: "Cancelar",
                creating: "Creando...",
                button: "Crear Organización",
                types: {
                    game: "Gaming/Juegos",
                    music: "Música/Artistas",
                    study: "Estudios/Educación",
                    business: "Negocios/Empresas",
                    creator: "Creadores de Contenido",
                    dev: "Desarrolladores/Tech",
                    general: "General/Misc",
                }
            },
        },
        common: {
            save: "Guardar",
            cancel: "Cancelar",
            edit: "Editar",
            delete: "Eliminar",
            search: "Buscar",
            loading: "Cargando...",
            error: "Ocurrió un error",
            success: "¡Éxito!",
            actions: "Acciones",
            status: "Estado",
            name: "Nombre",
            category: "Categoría",
            price: "Precio",
            description: "Descripción",
        },
        store: {
            title: "Tienda Oficial",
            inventory_title: "Gestión de Inventario",
            inventory_desc: "Crea paquetes VIP, artículos de juego y suscripciones con entrega automatizada.",
            new_product: "Nuevo Producto",
            create_product_title: "Registrar Nuevo Producto",
            edit_product_title: "Editar Producto",
            product_name: "Nombre del Producto",
            product_slug: "Slug (URL)",
            base_price: "Precio Base",
            billing_cycle: "Ciclo de Facturación",
            delivery_driver: "Driver de Entrega",
            save_product: "Guardar Producto",
            one_time: "Pago Único",
            monthly: "Mensual",
            yearly: "Anual",
            manual_delivery: "Entrega Manual",
            auto_delivery: "Automático",
            no_products: "No se encontraron productos",
            add_first_product: "Añade tus primeros artículos para empezar a vender.",
            view_in_store: "Ver en Tienda",
            exclusive_feature: "Función Exclusiva",
            exclusive_desc: "La gestión avanzada solo está disponible en los planes PRO, ENTERPRISE y MAX.",
            overview: {
                total_revenue: "Ingresos Totales",
                pending_orders: "Pedidos Pendientes",
                active_products: "Productos Activos",
                locked_store: "Módulo de Tienda Bloqueado",
                locked_desc: "El Motor de Tienda V1 solo está disponible para suscriptores del plan PRO, ENTERPRISE o MAX. Mejore su plan para empezar a vender artículos y VIPs de forma automatizada.",
                automation_title: "Automatización y Entrega",
                automation_desc: "OrbitOS entrega sus productos automáticamente vía Discord Bots o Webhooks para FiveM/Minecraft tan pronto como se aprueba el pago. Asegúrese de configurar la entrega correctamente en cada producto.",
                bot_api_status: "Estado de la API del Bot",
                operational: "Operacional",
            },
            settings: {
                title: "Configuración de la Tienda",
                subtitle: "Gesione gateways de pago, visibilidad pública y comportamiento del checkout.",
                engine_status: "Estado del Motor de Tienda",
                engine_status_desc: "Controle si su tienda es pública para los jugadores.",
                currency: "Moneda Transaccional",
                checkout_provider: "Proveedor de Pago",
                stripe_desc: "Pago internacional seguro y suscripciones nativas.",
                pix_desc: "Pago instantáneo vía QR Code para el público brasileño.",
                webhook_url: "URL de Webhook",
                copy_webhook: "Copie esta URL en el Dashboard de su proveedor.",
            }
        },
        billing: {
            title: "Facturación y Planes",
            current_plan: "Plan Actual",
            manage_subscription: "Gestionar Suscripción",
            update_card: "Actualizar Tarjeta",
            usage_limits: "Límites de Uso",
            invoice_history: "Historial de Facturas",
            choose_plan: "Elige tu Plan",
            free_plan_desc: "Para empezar y explorar la plataforma.",
            pro_plan_desc: "Para equipos que necesitan más potencia.",
            enterprise_plan_desc: "Para comunidades en crecimiento.",
            max_plan_desc: "La experiencia definitiva y soporte VIP.",
            upgrade_cta: "Mejorar Plan",
            active_plan: "Plan Activo",
            per_month: "mes",
            enterprise_upsell_title: "Escalabilidad Ilimitada con Enterprise",
            enterprise_upsell_desc: "¿Tu comunidad está creciendo? El plan Enterprise ofrece soporte 24/7, SLA garantizado, bots dedicados e integraciones personalizadas para grandes operaciones.",
            enterprise_upsell_button: "Explorar Enterprise",
            upcoming_invoice: "Próxima Factura",
            checkout_redirect: "Redirigiendo al checkout...",
            portal_redirect: "Abriendo portal del cliente...",
            success_msg: "¡Suscripción actualizada con éxito!",
            success_desc: "Los cambios pueden tardar unos minutos en reflejarse en el panel.",
            cancel_msg: "El proceso de checkout fue cancelado.",
            cancel_desc: "No se realizó ningún cargo.",
            unlimited: "ilimitado",
            usage_servers: "Servidores de Discord",
            usage_tickets: "Tickets Abiertos (este mes)",
            invoice_id: "Factura",
            invoice_date: "Fecha",
            invoice_plan: "Plan",
            invoice_amount: "Valor",
            invoice_status: "Estado",
            invoice_action: "Acción",
            plans: {
                free: {
                    name: "Gratis",
                    description: "Para empezar y explorar la plataforma.",
                    features: ["Hasta 3 servidores", "100 tickets/mes", "Analítica básica", "Soporte por email"]
                },
                pro: {
                    name: "Pro",
                    description: "Para equipos que necesitan más potencia.",
                    features: ["Servidores ilimitados", "Tickets ilimitados", "Analítica avanzada", "Multi-staff", "Webhooks Discord", "Soporte prioritario"]
                },
                enterprise: {
                    name: "Enterprise",
                    description: "Para grandes operaciones y corporaciones.",
                    features: ["Todo del Pro", "99.9% SLA", "Gerente dedicado", "Integraciones custom", "Deploy on-premise", "Soporte 24/7"]
                },
                max: {
                    name: "MAX",
                    description: "Poder total. Para los líderes del sector.",
                    features: ["Todo del Enterprise", "Ilimitado en todo", "URL personalizada", "Bot engine dedicado", "Enfoque en IA", "Soporte VIP 24/7"]
                }
            }
        },
        analytics: {
            active_servers: "Servidores Activos",
            open_tickets: "Tickets Abiertos",
            staff_online: "Staff Online",
            revenue_24h: "Ingresos (24h)",
            monthly_growth: "Crecimiento Mensual",
            revenue_desc: "Volumen de facturación y órdenes procesadas.",
            audit_events: "Audit Events",
            infra_tracking: "Seguimiento de infraestructura global.",
            view_audit_log: "Ver Registro de Auditoría Completo",
            coming_soon: "Próximamente: Registro de Auditoría Completo",
            overview_title: "RESUMEN_INFRA",
            revenue_data: "DATOS_INGRESOS",
            no_activity: "No se registró ninguna actividad en el registro reciente.",
            modified_by: "modificado por",
            version: "Versión OrbitOS",
            sla: "SLA Garantido",
            data_isolation: "Aislamiento de Datos",
            conn_active: "CONEXIÓN ACTIVA CON EL MOTOR DE INFRAESTRUCTURA",
        },
        auth: {
            title: "Bienvenido de nuevo",
            subtitle: "Conecta tu cuenta de Discord para continuar.",
            discord_btn: "Entrar con Discord",
            google_btn: "Entrar con Google",
            github_btn: "Entrar con GitHub",
            authenticating: "Autenticando...",
            info: "Información",
            redirect_msg: "Serás redirigido a Discord para autenticarte.",
            terms_msg: "Al entrar, aceptas nuestros",
            terms_link: "Términos de Servicio",
            privacy_link: "Política de Privacidad",
            back_home: "Volver a la página de inicio",
            error_title: "Fallo en la autenticación",
            error_denied: "Cancelaste el acceso en Discord.",
            error_no_token: "El servidor no devolvió el token.",
            error_generic: "Inténtalo de nuevo. Si persiste, verifica la configuración de tu Discord App.",
            server_offline: "Servidor no disponible o inaccesible en este momento.",
            professional_dashboard: "Panel Profesional",
        },
        docs: {
            title: "Referencia de API",
            subtitle: "Documentación completa de los endpoints disponibles para integración con OrbitOS.",
            base_url: "Base URL",
            base_url_desc: "Todas las peticiones son relativas a esta URL.",
            auth: "Autenticación",
            auth_desc: "Token JWT obtenido mediante inicio de sesión con Discord OAuth2.",
            rate_limits: "Rate Limits",
            rate_limit_global: "Global (por IP)",
            rate_limit_internal: "Rutas internas",
            plan_limits: "Límites por Plan",
            quick_ref: "Referencia Rápida de Endpoints",
            usage_example: "Ejemplo de Uso",
            interactive_swagger: "Swagger UI Interactivo",
            interactive_swagger_desc: "Pruebe los endpoints directamente en el navegador",
            openapi_spec: "OpenAPI JSON Spec",
            openapi_spec_desc: "Importe en Postman, Insomnia o su SDK favorito",
        },
        settings: {
            general: "General",
            language: "Idioma",
            save: "Guardar Cambios",
            success: "¡Configuración actualizada con éxito!",
            title: "Configuración del Sistema",
            subtitle: "Gestiona las preferencias de tu cuenta y del sistema.",
            security: "Seguridad",
            notifications: "Notificaciones",
            appearance: "Apariencia",
            system_info: "Información del Sistema",
            system_info_desc: "Configura el nombre, la URL base y el idioma de tu plataforma.",
            org_name: "Nombre de la Organización",
            select_language: "Selecciona un idioma",
            language_help: "Esto afectará a los mensajes del bot en Discord y a las interfaces públicas.",
            security_title: "Seguridad y Autenticación",
            security_desc: "Gestiona las claves de API y los métodos de inicio de sesión.",
            api_key: "Clave de API del Core",
            two_factor: "Autenticación de Dos Factores",
            two_factor_desc: "Añade una capa extra de seguridad.",
            two_factor_on: "2FA activado",
            two_factor_off: "2FA desactivado",
            reset_keys: "Restablecer Claves",
            update_security: "Actualizar Seguridad",
            notifications_title: "Notificaciones",
            notifications_desc: "Elige cómo quieres ser alertado sobre eventos importantes.",
            email_notif: "Notificaciones por Correo",
            email_notif_desc: "Recibe resúmenes semanales de analítica.",
            discord_notif: "Webhooks de Discord",
            discord_notif_desc: "Alertas de tickets críticos directamente en tu canal.",
            appearance_white_label: "Personalización del Portal (White-Label)",
            appearance_desc: "Configura temas, ajustes preestablecidos de diseño, logotipos y CSS personalizado para tu portal público y panel de control.",
            visual_identity: "Editor de Identidad Visual",
            visual_identity_desc: "Acceso a plantillas premium, fondos aurora y tipografía avanzada.",
            open_editor: "Abrir Editor",
            panel_preferences: "Preferencias del Panel",
            panel_preferences_desc: "Configuraciones rápidas de visualización local.",
            primary_color: "Color Primario",
            high_contrast: "Modo de Alto Contraste",
            high_contrast_desc: "Mejora la legibilidad en ambientes claros.",
            slug: "Slug Único (URL)",
            slug_help: "El identificador único de su comunidad en la plataforma.",
            subdomain: "Subdominio OrbitOS",
            custom_domain: "Dominio Propio",
            maintenance: "Mantenimiento Global",
            maintenance_desc: "Active para deshabilitar el acceso de todos los clientes temporalmente.",
            maintenance_on: "Modo mantenimiento activado",
            maintenance_off: "Modo mantenimiento desactivado",
            saving: "Guardando...",
        },
        automations: {
            onboarding: {
                how_it_works: "Cómo funciona",
                discord_example: "Ejemplo en Discord",
                how_to_test: "Cómo probar",
                test_steps: "Pasos para probar",
                ready_config: "Configuración Lista",
                tips: "Prácticas recomendadas",
            },
            modules: {
                ticket: {
                    subtitle: "Organice las solicitudes de ayuda de los jugadores en canales privados, con historial y categorías.",
                    how_it_works: "El jugador hace clic en el botón '📩 Abrir Ticket'. El bot crea un canal privado, visible solo para el jugador + el equipo del staff.",
                    test_steps: [
                        "Active el módulo Tickets de Soporte en el panel.",
                        "Configure el canal para el mensaje inicial y la categoría de tickets.",
                        "En Discord, use /painel ticket para generar el botón.",
                        "Haga clic en 'Abrir Ticket' y verifique la creación del canal."
                    ]
                },
                whitelist: {
                    subtitle: "Filtra a los nuevos jugadores con preguntas predefinidas antes de dar acceso al servidor.",
                    how_it_works: "Cuando el jugador usa /whitelist, el bot inicia el flujo de preguntas. El resultado se envía al staff para su aprobación.",
                    test_steps: [
                        "Active el módulo Whitelist y configure el canal del staff.",
                        "En Discord, use /whitelist como jugador.",
                        "Responda las preguntas y verifique la recepción del staff.",
                        "Pruebe la aprobación/rechazo manual (si está configurado)."
                    ]
                },
                welcome_message: {
                    subtitle: "Cree una primera impresión memorable para los nuevos jugadores.",
                    how_it_works: "El bot detecta cuando alguien se une al servidor y envía un mensaje personalizado al canal elegido. Puede usar variables como {user} para mencionar a la persona.",
                    test_steps: [
                        "Configure el canal de bienvenida y el mensaje deseado.",
                        "Use el botón 'Probar' en el panel (si está disponible) o invite a una cuenta secundaria/amigo.",
                        "Verifique si el bot envió el mensaje y si las variables se reemplazaron correctamente."
                    ]
                },
                autorole: {
                    subtitle: "Automatice la asignación de roles iniciales.",
                    how_it_works: "Tan pronto como un jugador se une, el bot asigna instantáneamente los roles seleccionados, sin necesidad de comandos.",
                    test_steps: [
                        "Seleccione los roles que deben asignarse.",
                        "Asegúrese de que el rol del bot (OrbitOS) esté POR ENCIMA de los roles que asignará en la configuración de Discord.",
                        "Pida a alguien que se una al servidor y vea si el rol se asignó en segundos."
                    ]
                },
                whitelist_quiz: {
                    subtitle: "Quiz automático para filtrar jugadores por conocimiento.",
                    how_it_works: "El jugador inicia el quiz mediante un comando o un botón. Debe acertar un porcentaje X de preguntas para ser aprobado y obtener el rol automáticamente.",
                    test_steps: [
                        "Cree las preguntas y defina las respuestas correctas.",
                        "Configure el porcentaje mínimo para aprobar.",
                        "En Discord, use /quiz para comenzar e intente responder como un jugador."
                    ]
                },
                server_status: {
                    subtitle: "Muestre estadísticas del servidor en los nombres de los canales.",
                    how_it_works: "El bot actualiza periódicamente los nombres de canales específicos para mostrar contadores de miembros o jugadores en tiempo real.",
                    test_steps: [
                        "Cree un canal de voz para que sirva de contador.",
                        "Configure el ID del canal y la plantilla (ej: 👥 {players} Jugadores).",
                        "Espere unos minutos y vea cómo el nombre del canal se actualiza automáticamente."
                    ]
                },
                coupon: {
                    subtitle: "Sistema de cupones para la tienda de su servidor.",
                    how_it_works: "Cree códigos de descuento para compras. Usted define el porcentaje y los límites de uso.",
                    test_steps: [
                        "Cree un cupón de prueba (ej: PRUEBA10) con un 10% de descuento.",
                        "En el sistema de la tienda, intente aplicar este cupón al pagar.",
                        "Verifique si el precio total se redujo correctamente."
                    ]
                },
                report: {
                    subtitle: "Centralice denuncias y sugerencias, anónimas o no.",
                    how_it_works: "Los miembros envían denuncias por comando. El staff recibe alertas en un canal privado para su revisión.",
                    test_steps: [
                        "Establezca el canal para recibir denuncias.",
                        "Use el comando de denuncia en Discord.",
                        "Verifique si el staff recibió la alerta con todos los detalles."
                    ]
                },
                application: {
                    subtitle: "Formularios de reclutamiento integrados con Discord.",
                    how_it_works: "Cree preguntas personalizadas. Los jugadores responden vía bot y el staff puede aprobar/denegar con un clic.",
                    test_steps: [
                        "Configure las preguntas de su solicitud.",
                        "Intente completar el formulario en Discord.",
                        "Como staff, apruebe la prueba y verifique si el jugador recibió el rol configurado."
                    ]
                },
                level_system: {
                    subtitle: "Gamifica tu servidor con XP y niveles automáticos.",
                    how_it_works: "Los miembros ganan experiencia (XP) enviando mensajes o participando en llamadas. Al alcanzar metas, suben de nivel y pueden ganar roles automáticos.",
                    test_steps: [
                        "Configure el multiplicador de XP en el panel.",
                        "En Discord, envíe algunos mensajes y use el comando /rank.",
                        "Verifique que el bot muestre su progreso correctamente."
                    ]
                },
                anti_raid: {
                    subtitle: "Protección avanzada contra bots e invasiones.",
                    how_it_works: "El bot monitorea entradas masivas o comportamientos sospechosos y aplica castigos automáticos (kick/ban) para proteger el servidor.",
                    test_steps: [
                        "Configure el límite de entradas por minuto.",
                        "El sistema funciona silenciosamente. Revise los registros de seguridad para ver al bot en acción."
                    ]
                },
                suggestion: {
                    subtitle: "Sistema de sugerencias con votación de la comunidad.",
                    how_it_works: "Los miembros envían sugerencias mediante un comando. La sugerencia se envía a un canal con reacciones ✅ y ❌ para votación pública.",
                    test_steps: [
                        "Configure el canal de sugerencias.",
                        "Use el comando de sugerencia en Discord.",
                        "Verifique que el mensaje se haya enviado con los botones/reacciones de voto."
                    ]
                },
                rules_accept: {
                    subtitle: "Obligatorio aceptar las reglas antes de ver el servidor.",
                    how_it_works: "El bot envía un mensaje con las reglas y un botón. El jugador solo obtiene acceso (rol) después de hacer clic en 'Aceptar'.",
                    test_steps: [
                        "Configure el rol de miembro y el canal de reglas.",
                        "Use el comando para generar el mensaje de reglas.",
                        "Haga clic en el botón de aceptar y verifique que se haya entregado el rol."
                    ]
                },
                verification: {
                    subtitle: "Sistema de verificación por captcha o botón.",
                    how_it_works: "Protege el servidor de bots maliciosos exigiendo que el usuario haga clic en un botón o resuelva un desafío simple al entrar.",
                    test_steps: [
                        "Configure el mensaje de verificación.",
                        "Entre con una cuenta de prueba y haga clic en el botón.",
                        "Verifique que se haya asignado el rol de verificado."
                    ]
                },
                store_panel: {
                    subtitle: "Muestre los artículos de su tienda directamente en Discord.",
                    how_it_works: "Genera una interface con selects y botones donde los jugadores pueden navegar por los productos e iniciar compras sin salir del chat.",
                    test_steps: [
                        "Agregue productos en su pestaña de Tienda.",
                        "En Discord, use el comando /tienda.",
                        "Verifique que los productos y precios aparezcan correctamente."
                    ]
                },
                growth_stats: {
                    subtitle: "Análisis de crecimiento y nuevas entradas.",
                    how_it_works: "Métricas detalladas sobre cuántos miembros entraron y salieron del servidor en los últimos días.",
                    test_steps: ["Acceda a la pestaña de Analytics para ver el gráfico actualizado."]
                },
                engagement_stats: {
                    subtitle: "Métricas de actividad y mensajes.",
                    how_it_works: "Descubra qué canales se usan más y a qué horas sus miembros están más activos.",
                    test_steps: ["Acceda a la pestaña de Analytics para ver el ranking de canales."]
                },
                revenue_stats: {
                    subtitle: "Informes de ventas y facturación.",
                    how_it_works: "Siga sus ventas en tiempo real con gráficos de facturación diaria, mensual e anual.",
                    test_steps: ["Verifique el panel financiero en la pestaña de Analytics."]
                },
                activity_stats: {
                    subtitle: "Monitoreo de presencia en voz y chat.",
                    how_it_works: "Informes sobre el tiempo promedio que los jugadores pasan en los canales de voz.",
                    test_steps: ["Consulte los datos de retención en la pestaña de Analytics."]
                },
                ranking: {
                    subtitle: "Muestre a los mejores jugadores de su servidor en tiempo real.",
                    how_it_works: "El bot genera una interfaz que enumera a los jugadores com más XP, dinero o victorias. El ranking se atualiza automáticamente.",
                    test_steps: [
                        "Defina qué categoría de ranking desea mostrar.",
                        "En Discord, use el comando /ranking.",
                        "Verifique que la tabla de líderes aparezca con las fotos y datos correctos."
                    ]
                },
                giveaway: {
                    subtitle: "Cree sorteos con requisitos de roles y tiempo.",
                    how_it_works: "Gestione sorteos de artículos o VIPs de forma automática. El bot elige al ganador y valida si aún está en el servidor.",
                    test_steps: [
                        "Cree un sorteo de prueba en Discord.",
                        "Pida a alguien que participe.",
                        "Fuerce el final y vea si el bot anuncia al ganador."
                    ]
                },
                faction_system: {
                    subtitle: "Gestión completa para grupos y facciones.",
                    how_it_works: "Permite crear grupos para que los jugadores se unan. Incluye roles internos, banco de facción y chat exclusivo entre miembros.",
                    test_steps: [
                        "Cree una facción de prueba en el panel.",
                        "Intente reclutar a un miembro usando el comando de facción.",
                        "Verifique si el nuevo miembro obtuvo acceso al chat privado del grupo."
                    ]
                },
                judicial_system: {
                    subtitle: "Control de procesos internos y juicios.",
                    how_it_works: "Crea un flujo para la gestión de incidencias, abogados y jueces dentro del servidor. Ideal para RP serio.",
                    test_steps: [
                        "Abra un caso de prueba en el panel judicial.",
                        "Asigne un abogado al caso.",
                        "Verifique si el canal del tribunal se creó automáticamente."
                    ]
                },
                in_game_logs: {
                    subtitle: "Sincronización de eventos del servidor de juego.",
                    how_it_works: "Recibe registros directamente desde su servidor (FiveM/Minecraft) y los muestra en canales específicos de Discord.",
                    test_steps: [
                        "Configure el Webhook en su servidor de juego.",
                        "Realice una acción en el juego (ej: matar a alguien).",
                        "Verifique que el registro apareció instantáneamente en Discord."
                    ]
                },
                anti_alt: {
                    subtitle: "Bloqueo automático de cuentas falsas y recientes.",
                    how_it_works: "Verifica la antigüedad de la cuenta de Discord y si tiene avatar. Se impide la entrada a cuentas sospechosas.",
                    test_steps: [
                        "Establezca un límite de 30 días para cuentas nuevas.",
                        "Intente unirse con una cuenta creada hoy.",
                        "Verifique si el bot expulsó la cuenta y envió el registro."
                    ]
                },
                mod_logs: {
                    subtitle: "Historial completo de castigos y avisos.",
                    how_it_works: "Centraliza todas las acciones de moderación (ban, kick, mute) en un canal secreto para auditoría.",
                    test_steps: [
                        "Aplique una advertencia (warn) a un usuario de prueba.",
                        "Verifique el canal de registros de moderación.",
                        "Compruebe si el motivo y el autor del castigo son correctos."
                    ]
                },
                conditional_workflow: {
                    subtitle: "Flujos automatizados basados en activadores y condiciones.",
                    how_it_works: "Usted define una regla (ej: si el jugador obtiene el rol VIP) y una acción (ej: enviar un DM).",
                    test_steps: [
                        "Cree una regla de prueba en el panel.",
                        "Ejecute la acción de activación en Discord.",
                        "Verifique si la automatización se activó."
                    ]
                },
                flash_sale: {
                    subtitle: "Cree ofertas de tiempo limitado para su tienda.",
                    how_it_works: "Establece un descuento agresivo por un corto período y notifica a los miembros interesados mediante mención.",
                    test_steps: [
                        "Abra una nueva oferta relámpago.",
                        "Verifique si el mensaje de anuncio se envió en el canal configurado.",
                        "Verifique si el precio en la tienda se actualizó automáticamente."
                    ]
                },
                staff_logs: {
                    subtitle: "Seguimiento de las acciones administrativas de su equipo.",
                    how_it_works: "Registra cuando un staff crea canales, cambia roles o edita permisos sensibles.",
                    test_steps: [
                        "Realice una acción administrativa (ej: crear un nuevo canal).",
                        "Verifique si el registro apareció en el canal secreto del staff."
                    ]
                },
                subscription: {
                    subtitle: "Gestione planes mensuales y roles recurrentes.",
                    how_it_works: "Vincula roles al estado de pago del usuario. Si la suscripción expira, el rol se elimina automáticamente.",
                    test_steps: [
                        "Vincule un rol a un producto recurrente.",
                        "Simule un pago o asígnelo manualmente en la tienda.",
                        "Verifique si el usuario recibió el rol después del procesamiento."
                    ]
                },
                poll: {
                    subtitle: "Cree encuestas interactivas con votos ilimitados.",
                    how_it_works: "Genera una interfaz con botones para que los miembros voten. Los resultados se muestran en tiempo real o al cerrar.",
                    test_steps: [
                        "Use el comando /poll para crear una encuesta.",
                        "Vote usando los botones en Discord.",
                        "Verifique si el recuento se actualizó correctamente."
                    ]
                },
                scheduled_messages: {
                    subtitle: "Programe anuncios y recordatorios periódicos.",
                    how_it_works: "Usted define el día, la hora y la frecuencia de los mensajes. El bot los envía automáticamente en el canal deseado.",
                    test_steps: [
                        "Programe un mensaje para dentro de 5 minutos.",
                        "Espere en Discord y verifique el envío."
                    ]
                },
                trigger_system: {
                    subtitle: "Respuestas automáticas a palabras clave específicas.",
                    how_it_works: "El bot monitorea el chat y responde con textos, imágenes o embeds cuando alguien escribe un término configurado.",
                    test_steps: [
                        "Cree un activador para la palabra 'ayuda'.",
                        "Escriba en el chat y verifique si el bot respondió."
                    ]
                },
                advanced_verification: {
                    subtitle: "Verificación segura vía sitio web o redes sociales.",
                    how_it_works: "Requiere que el usuario vincule una cuenta externa (ej: GitHub, Steam) para probar su identidad antes de entrar.",
                    test_steps: [
                        "Haga clic en el botón de verificación avanzada.",
                        "Complete el flujo en el navegador.",
                        "Verifique si se otorgó el rol después de regresar."
                    ]
                },
                payment_logs: {
                    subtitle: "Registros de ventas en tiempo real para el staff.",
                    how_it_works: "Envía una alerta en el canal elegido cada vez que se aprueba um nuevo pago o se renueva una suscripción.",
                    test_steps: [
                        "Realice una compra de prueba en la tienda.",
                        "Verifique si el registro de pago apareció en el canal configurado."
                    ]
                }
            },
            common: {
                loading: "Cargando...",
                error: "Ocurrió un error",
                success: "Éxito",
                status: "Estado",
                show: "Mostrar",
                hide: "Ocultar",
                saving: "Guardando...",
                coming_soon: "Próximamente",
            }
        }
    }
};

export const getI18n = (lang: string = 'pt-BR') => {
    return translations[lang as Language] || translations['pt-BR'];
};
