# 🎨 Web Design & Modals — Plataforma do Bot

Este documento define o **web design** e os **modais principais** da plataforma do bot (Dashboard Web).

Objetivo:
- Interface moderna, dark, limpa e profissional.
- Focada em donos de servidor, staff e administradores.
- Consistente com produto SaaS premium.

---

## 1️⃣ Direção de Design (UI Geral)

### Paleta base (modo dark)

- **Background principal:** `#05060A` (quase preto, tech)
- **Cards / superfícies:** `#0B0F18` / `#0F172A`
- **Bordas / Divisores:** `#1F2937`
- **Texto primário:** `#F9FAFB`
- **Texto secundário:** `#9CA3AF`
- **Ações primárias:** `#22C55E` (verde “online/sucesso”) ou `#10B981`
- **Ações de alerta:** `#F97316` (warning), `#EF4444` (danger)
- **Accent sutil:** `#3B82F6` (azul tech para links e highlights)

### Estilo geral

- Layout tipo SaaS: sidebar fixa + topbar + conteúdo em cards.
- Bordas levemente arredondadas (`border-radius: 0.75rem` ~ `rounded-xl`).
- Sombra suave (`shadow-lg` / `shadow-md` discreta).
- Ícones minimalistas (Lucide / Heroicons).
- Tipografia:
  - Títulos: sem serifa moderna (ex: Inter, Poppins, SF Pro, etc.)
  - Texto normal: Inter 14–15px

### Comportamento

- **Responsivo**: Mobile-first, mas otimizado para desktop.
- Skeleton loaders para listas e cards (nada aparece “do nada”).
- Estados visuais claros: loading, error, empty state.

---

## 2️⃣ Layout Principal

### Sidebar (Esquerda)

Fixada em todas as páginas autenticadas.

Itens:

- Logo + nome do produto
- Navegação:
  - Dashboard
  - Servidores
  - Tickets
  - Staff
  - Analytics
  - Configurações
- Rodapé com:
  - Plano atual (FREE/PRO/ENTERPRISE)
  - Botão “Upgrade”

### Topbar (Cabeçalho)

- Título da página atual (ex: “Dashboard”, “Tickets”).
- Breadcrumb simples se necessário.
- À direita:
  - Seletor de organização (se houver mais de uma)
  - Avatar do usuário
  - Menu (Perfil, Logout)

### Área de Conteúdo

- Sempre com **padding** confortável (ex: `p-6`).
- Cards com:
  - Título
  - Subtítulo ou meta
  - Conteúdo principal

---

## 3️⃣ Telas Principais

### 3.1. Dashboard Overview

Objetivo: visão rápida do estado do servidor/comunidade.

Elementos:

- Cards no topo (4 colunas em desktop, stack em mobile):
  - **Servidores ativos**
  - **Tickets abertos**
  - **Staff online/ativa**
  - **Plano atual**

- Sessão “Atividade recente”:
  - Lista de:
    - Tickets criados/fechados
    - Punições aplicadas
    - Alertas de servidor (offline/online)

- Sessão “Resumo de Moderação”:
  - Mini gráfico: punições por tipo (warn/kick/ban) nos últimos 7 dias.

---

### 3.2. Página “Servidores”

Lista de todos os Discord servers conectados à organização.

Tabela:

- Colunas:
  - Nome do servidor
  - Guild ID
  - Status do bot (online/offline / conectado)
  - Plano (Free/Pro/Enterprise)
  - Última atividade
  - Ações (Ver / Configurar)

Ações globais:

- Botão **“Adicionar servidor”** (abre modal).
- Filtro por status (ativo/inativo).

---

### 3.3. Página “Tickets”

Lista de tickets de suporte/moderação.

Filtros:

- Status: Aberto / Em andamento / Fechado
- Tipo: Suporte / Denúncia / Financeiro / Outros
- Staff responsável
- Período

Lista (visual de tabela ou cards):

- ID do ticket
- Título / resumo
- Usuário (Discord)
- Categoria
- Status (badge com cor)
- Responsável
- Última atualização

Clique em um ticket → abre **modal de detalhes do ticket**.

---

### 3.4. Página “Staff”

Lista de membros da staff por servidor selecionado.

Elementos:

- Seletor de servidor no topo.
- Cards ou tabela:

Colunas:

- Nome (Discord)
- Função (Owner, Admin, Mod, Helper)
- Tickets resolvidos
- Punições aplicadas
- Último acesso

Ações:

- Botão **“Adicionar membro de staff”**
- Ação por linha: Editar / Remover / Ver histórico

---

### 3.5. Página “Analytics”

Gráficos em cards:

- Tickets por dia / semana
- Punições por período
- Tempo médio de resposta
- Crescimento de membros (se API permitir)
- Atividade por horário

Uso de gráficos de linha, barras e pizza simples.

---

### 3.6. Página “Configurações”

Mínimo:

- Dados da organização (nome, owner)
- Plano atual
- Botão **“Upgrade de plano”**
- Configurações do servidor selecionado:
  - Canais de log
  - Categoria de tickets
  - Staff role (ID do role de staff)
  - Integrações (ex: toggle FiveM, webhook, etc.)

---

## 4️⃣ Modals — Especificação

### 4.1 Modal — Adicionar Servidor

**Trigger:** Botão “Adicionar servidor” na página Servidores.

**Objetivo:** Vincular um novo Discord server ao sistema.

**Campos:**

- Select/Dropdown: Organização (se houver mais de uma)
- Input (readonly ou ajuda): “Adicione o bot ao seu servidor primeiro através deste link” (com botão copiar link de invite).
- Input: Guild ID (opcional se o backend preencher automaticamente pelo bot)
- Input: Nome do servidor (preenchido automaticamente se possível, ou editável)

**Ações:**

- Botão primário: **“Registrar servidor”**
- Botão secundário: Cancelar

Estado:

- Loading no botão ao enviar.
- Erro acima do formulário se falhar.
- Sucesso: fechar modal + toast de sucesso.

---

### 4.2 Modal — Configuração de Servidor

**Trigger:** Botão “Configurar” na linha de um servidor.

**Conteúdo em abas:**

- Aba 1: **Geral**
  - Nome do servidor (apenas exibição, opcional edição)
  - Status (badge)
  - Opção “Desativar servidor” (toggle ou botão danger)

- Aba 2: **Canais & Roles**
  - Selecionar canal de logs (dropdown ou campo pra ID)
  - Selecionar categoria de tickets
  - Selecionar role Staff
  - Botão “Sincronizar com Discord” (se tiver API pra isso)

- Aba 3: **Integrações**
  - Seção FiveM:
    - Host
    - Porta
    - Testar conexão (botão, com feedback visual)

**Ações:**

- Botão primário: **“Salvar alterações”**
- Botão secundário: Cancelar

---

### 4.3 Modal — Detalhes do Ticket

**Trigger:** Clique em um ticket na lista.

**Layout:**

- Header:
  - ID do ticket
  - Status (badge)
  - Categoria
  - Botões:
    - Mudar status (ex: dropdown: Aberto / Em andamento / Fechado)
    - Atribuir/Remover staff responsável

- Corpo:
  - Dados do usuário:
    - Nome + Avatar Discord
    - ID
  - Histórico de mensagens do ticket (timeline/scroll):
    - Mensagem do usuário
    - Respostas da staff
    - Data/hora
  - Campo “Adicionar resposta rápida” (input/textarea)

- Rodapé:
  - Botão “Responder”
  - Botão “Fechar ticket” (danger, com confirmação)

---

### 4.4 Modal — Criar Ticket Manualmente (interno)

Útil para staff abrir ticket em nome de um player.

**Campos:**

- Selecionar servidor
- Usuário (ID ou nome)
- Categoria
- Título
- Descrição inicial

---

### 4.5 Modal — Adicionar Membro de Staff

**Trigger:** Botão “Adicionar staff” na página Staff.

**Campos:**

- Servidor (dropdown)
- Usuário (ID do Discord)
- Função (OWNER / ADMIN / MOD / HELPER)
- Observações (opcional)

**Ações:**

- Botão “Adicionar”
- Cancelar

---

### 4.6 Modal — Visualizar Histórico de Staff

**Trigger:** Ação “Ver histórico” na linha da staff.

Conteúdo:

- Nome + avatar
- Função atual
- Cards:
  - Tickets resolvidos
  - Punições aplicadas
  - Tempo médio de resposta
- Timeline de ações relevantes:
  - Entrada na equipe
  - Promoções / mudanças de função
  - Ações marcantes (ex: grandes ban waves)

---

### 4.7 Modal — Upgrade de Plano

**Trigger:** Botão “Upgrade” na sidebar ou em Settings.

Layout:

- Tabela comparativa horizontal:
  - FREE | PRO | ENTERPRISE
  - Limites e features por plano:
    - Tickets/mês
    - Staff members
    - Integrações
    - Analytics
- Botões “Escolher plano”.

Fluxo:

- Ao escolher plano:
  - Se já tiver billing: redireciona para checkout Stripe.
  - Se ainda não: mostrar mensagem “Entre em contato” ou fluxo manual.

---

## 5️⃣ Interações e Feedback

### Feedback visual obrigatório:

- Toast de sucesso/erro para:
  - Salvando config
  - Registrando servidor
  - Criando ticket
  - Mudando status

- Skeleton enquanto carrega:
  - Lista de tickets
  - Lista de servidores
  - Dashboard overview

---

## 6️⃣ Guideline para Implementação

Quando for implementar:

- Usar componentes reutilizáveis:
  - `<Modal />`
  - `<ConfirmDialog />`
  - `<DataTable />`
  - `<Badge />`
  - `<StatusDot />`
- Manter consistência de spacing:
  - Use múltiplos de 4 ou 8 (`4, 8, 12, 16, 24, 32`).
- Ícones sempre alinhados com texto.
- Não encher de informação em um modal — preferir abas.

---

## 7️⃣ Resumo do Web Design

- Visual: SaaS dark premium
- Experiência: limpa, direta, focada em operação
- Foco em:
  - Staff
  - Tickets
  - Segurança
  - Configuração simples
- Pronto para:
  - Escalar
  - Receber novos módulos
  - Ser “o melhor bot” em percepção de qualidade visual.