# Discord Automation Platform
## Documento Técnico Oficial – v1.0

---

# 1. OBJETIVO

Construir uma plataforma modular de automação para Discord que:

- Atenda múltiplos tipos de comunidade.
- Seja organizada por módulos.
- Adapte a UI conforme tipo de comunidade.
- Controle recursos por plano.
- Utilize um bot global multi-tenant.
- Permita expansão sem duplicação de código.

---

# 2. ARQUITETURA DE CAMADAS

## 2.1 Camada de Plano

Planos existentes:
- FREE
- PRO
- MAX

Plano controla:
- Limite de instâncias de módulos
- Limite de perguntas por formulário
- Limite de workflows
- Customização visual (banner, branding)
- Acesso a analytics avançado
- Recursos premium

Plano NÃO controla tipo de comunidade.
Plano NÃO duplica módulos.

---

## 2.2 Camada de Tipo de Comunidade

Campo obrigatório na criação do servidor:

`community_type`

Valores:
- game
- music
- study
- business
- general
- creator
- dev

Função do community_type:
- Reorganizar UI
- Definir módulos recomendados
- Aplicar presets
- Alterar nomes/descrições padrão
- Alterar ordem de exibição

Regras:
- Pode ser alterado depois.
- Não remove módulos existentes.
- Não altera lógica técnica.
- Apenas reorganiza e sugere novos presets.

---

## 2.3 Camada de Módulos Base

Todos os módulos são universais.
Não devem ser duplicados por tipo de comunidade.

### Módulos:

### Onboarding
- welcome_message
- autorole
- rules_accept
- verification

### Support
- ticket
- application
- suggestion
- report

### Engagement
- level_system
- ranking
- giveaway
- poll

### Monetization
- store_panel
- payment_logs
- subscription
- coupon
- flash_sale

### Security
- anti_raid
- anti_alt
- mod_logs
- staff_logs
- advanced_verification

### Automation
- scheduled_messages
- conditional_workflow
- trigger_system

### Game Integration
- whitelist
- server_status
- faction_system
- judicial_system
- in_game_logs

### Analytics
- growth_stats
- engagement_stats
- revenue_stats
- activity_stats

---

# 3. ESTRUTURA DO DASHBOARD

## 3.1 Página: Bots & Automação

### Seção 1 – Recomendado para sua comunidade
- Baseado em community_type
- Exibe módulos com prioridade
- Cards grandes com CTA “Ativar” ou “Configurar”

### Seção 2 – Explorar todos os módulos
- Lista completa
- Organizada por categoria
- Filtros por categoria

Nenhum módulo fica invisível.
Apenas reorganizado.

---

# 4. SISTEMA DE PRESETS

Cada módulo possui presets por community_type.

Exemplo:
Ticket:

game:
- categorias: bug, financeiro, denúncia

music:
- categorias: parceria, evento, sugestão

study:
- categorias: dúvida, inscrição, suporte técnico

Presets aplicados apenas na primeira ativação.
Depois usuário pode editar livremente.

---

# 5. BOT GLOBAL

Arquitetura:
- Um bot global multi-tenant.
- Comandos registrados por guild conforme módulos ativos.
- Apenas comandos ativos devem aparecer na guild.

Fluxo:
Discord → Bot → Backend → Database → Dashboard
Dashboard → Backend → Bot → Discord

Bot NÃO deve conter lógica de plano.
Bot executa apenas config validada pelo backend.

---

# 6. CONTROLE DE PLANO (FEATURE FLAGS)

Backend deve possuir sistema de capabilities por plano.

Exemplo:

FREE:
- max_modules: limitado
- visual_customization: false
- advanced_automation: false
- branding_removal: false

PRO:
- max_modules: alto
- visual_customization: parcial
- advanced_automation: true
- branding_removal: false

MAX:
- max_modules: ilimitado
- visual_customization: total
- advanced_automation: true
- branding_removal: true

Frontend deve:
- Ocultar ou bloquear campos conforme plano.
- Exibir CTA de upgrade quando necessário.

Backend deve:
- Validar limites sempre.
- Nunca confiar apenas no frontend.

---

# 7. ESTRUTURA DE BANCO SUGERIDA

## Tabelas Principais

tenants
- id
- plan_id
- community_type

modules
- id
- name
- category

tenant_modules
- id
- tenant_id
- module_id
- config (JSON)
- active (boolean)

module_presets
- id
- module_id
- community_type
- preset_config (JSON)

plan_capabilities
- id
- plan_id
- key
- value

---

# 8. PRINCÍPIOS DE DESENVOLVIMENTO

- Nunca duplicar módulo por tipo.
- Separar claramente:
  - Plano
  - Tipo de comunidade
  - Módulo técnico
- Sempre validar limites no backend.
- Bot deve ser stateless e dependente da API.
- UI deve usar progressive disclosure.
- Defaults devem funcionar sem configuração avançada.

---

# 9. OBJETIVO FINAL

Criar uma plataforma que:

- Seja modular.
- Seja adaptável.
- Seja organizada por contexto.
- Seja escalável.
- Seja simples para o usuário.
- Seja poderosa por baixo.

---

FIM DO DOCUMENTO v1.0
