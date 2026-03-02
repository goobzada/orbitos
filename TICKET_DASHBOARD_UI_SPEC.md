# 🖥 TICKET_DASHBOARD_UI_SPEC.md
## Especificação de UI — Sistema de Tickets no Painel SaaS

Este documento define **como será a interface no Dashboard Web** para gerir:

- Portais de Ticket (Ticket Hubs)
- Botões
- Templates (Modal Builder)
- Visual (banners, cores)
- Visualização e gestão de tickets

---

# 1️⃣ Páginas principais de Tickets

1. `/dashboard/tickets/overview`  
   Visão geral de tickets (status, métricas, gráficos)

2. `/dashboard/tickets/portals`  
   Criação e edição dos **Portais de Ticket** (painéis que vão para o Discord)

3. `/dashboard/tickets/templates`  
   Builder de formulários (Modals) por tipo de ticket.

4. `/dashboard/tickets/list`  
   Lista de tickets em aberto / fechados.

5. `/dashboard/tickets/settings`  
   Configurações gerais (SLA, macros, rating, canais default).

---

# 2️⃣ Página: Portals (`/tickets/portals`)

### Layout

- Header:
  - Título: "Portais de Ticket"
  - Botão: **+ Criar Portal**

- Lista em grid ou tabela:
  - Nome do portal
  - Canal de publicação
  - Status (Ativo/Inativo)
  - Quantidade de botões
  - Última atualização
  - Ações: Editar / Publicar no Discord / Desativar

### Criar/Editar Portal (Modal ou página dedicada)

Campos:

- Nome do Portal
- Descrição
- Canal de publicação (dropdown com canais do Discord)
- Upload de Banner (opcional)
- Cor do embed (color picker)
- Tipo de UI:
  - Botões
  - Select Menu

Bloco: “Botões”

- Lista de botões existentes
- Botão: **+ Adicionar Botão**

---

# 3️⃣ Editor de Botão (modal embutido)

Campos do botão:

- Label do botão
- Emoji (campo texto ou picker)
- Estilo:
  - Primary
  - Success
  - Danger
  - Secondary
- Template vinculado (dropdown de TicketTemplates)
- Cargo necessário (dropdown de roles do Discord) — opcional
- Ordem (para organizar exibição)

Botões:
- Salvar
- Cancelar

Preview na direita:
- Exibição de como ficará no Discord (layout aproximado).

---

# 4️⃣ Página: Templates (`/tickets/templates`)

### Lista de Templates:

Colunas:

- Nome
- Chave interna
- Servidor
- Status
- Usado em quantos Portais
- Ações: Editar / Duplicar / Desativar

### Criar/Editar Template (Modal Builder)

Campos gerais:

- Nome do Template (Ex: Suporte Geral)
- Chave interna (`general_support`)
- Título do Modal (Ex: "Criar ticket de suporte")
- Idioma (pt-BR, en-US, etc.)
- Ativo? (toggle)

Bloco “Campos do Formulário”:

- Lista ordenável de campos (drag & drop).
- Para cada campo:
  - Label
  - Tipo:
    - Short Text
    - Long Text
    - Number
    - Select
    - Checkbox
  - Placeholder
  - Obrigatório (checkbox)
  - Opções (se for Select/Checkbox):
    - + Adicionar opção (label + value)
  - Botões:
    - Duplicar campo
    - Remover

Preview em tempo real:

- Mock do modal com campos renderizados.

---

# 5️⃣ Página: Tickets (`/tickets/list`)

### Filtros:

- Status: Aberto / Em progresso / Fechado / Cancelado
- Prioridade: Low / Medium / High / Critical
- Servidor
- Template (tipo de ticket)
- Staff responsável
- Período (data de abertura/fechamento)
- Campo de busca (por ID de usuário, ticket, assunto)

### Tabela:

Colunas:

- ID do Ticket
- Servidor
- Usuário
- Tipo (Template)
- Prioridade
- Status
- Responsável
- Criado em
- Atualizado em
- Ações: Abrir (detalhe)

### Detalhe do Ticket (drawer ou página)

Seções:

- Cabeçalho:
  - ID, status, prioridade
  - Servidor, portal, template
  - Botões:
    - Atribuir/Alterar responsável
    - Mudar status
    - Fechar ticket
- Lado esquerdo:
  - Timeline de mensagens (estilo chat/log)
- Lado direito:
  - Dados do formulário (os campos preenchidos)
  - Rating (se houver)
  - SLA (cumprido ou quebrado)
  - Logs de ação (troca de status, reatribuições)

---

# 6️⃣ Página: Settings (`/tickets/settings`)

Sessões:

### 6.1 Configurações Globais

- Canal padrão de logs de ticket
- Se rating está habilitado (toggle)
- Se transcrição automática está ativa

### 6.2 SLA (Para planos Pro/Enterprise)

- Lista de regras de SLA (`TicketSlaPolicy`)
- Botão: **+ Criar SLA**

Criar SLA:
- Nome
- Template (opcional)
- Prioridade (opcional)
- Tempo para primeira resposta (minutos)
- Tempo para resolução (minutos)
- Toggle: padrão?

---

### 6.3 Macros

- Lista de macros (`TicketMacro`)
- Campos:
  - Nome
  - Categoria
  - Conteúdo
- Botão: **+ Criar Macro**

---

# 7️⃣ UX Geral

- Design Linear-like:
  - Muito espaço branco
  - Cards claros
  - Tipografia limpa
- Botões principais sempre bem visíveis.
- Feedback de erro/sucesso com toasts.
- Confirmação para ações destrutivas (fechar, deletar).

---

# 8️⃣ Integração com Bot

Em cada lugar onde algo impacta o Discord (ex: publicar Portal):

- O painel faz:
  - `POST /ticket-portals/{id}/publish`
- Core API:
  - Calcula embed, botões, etc.
  - Envia instrução para Bot Engine.
- Bot:
  - Cria/edita mensagem no canal correto.

---

# 9️⃣ Futuro (V2+)

- Visual builder com drag & drop para Portais.
- Estatísticas por Portal (quantos tickets vieram de cada botão).
- A/B testing de layouts.
