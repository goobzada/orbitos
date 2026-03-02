# 📊 Análise e Estrutura Atual do SaaSBot (V1)

Este documento descreve a estrutura atual do projeto SaaSBot, suas integrações, evoluções recentes e uma análise crítica do estado atual, incluindo os próximos passos recomendados.

---

## 🏗️ 1. Arquitetura Geral

O SaaSBot opera sob uma arquitetura de microsserviços bem definida, separando claramente as responsabilidades de Frontend, Backend e Interação com o Discord.

A regra fundamental mantida em todos os módulos é: **"O Bot executa, a API decide."**

### 1.1. Componentes Principais

1. **Dashboard (Next.js 14 / React)**
   - **Papel:** Interface do usuário (Admin/Staff) para visualização e configuração do SaaS.
   - **Stack:** Next.js (App Router), TailwindCSS, Shadcn/UI, Axios, Lucide Icons.
   - **Estado:** Autenticação mockada (Mock Login com Discord). Telas principais (Overview, Tickets list, Staff, Portals list, Templates list) construídas visualmente usando dados reais ou fallback mockados, integradas aos endpoints da Core API via hooks do React (`useServers`, `useTickets`, `useOverviewStats`).

2. **Core API (Node.js / Express)**
   - **Papel:** O "Cérebro" do sistema. Gerencia o banco de dados, regras de negócio e expõe rotas HTTP internas (para o Bot) e públicas/autenticadas (para o Dashboard).
   - **Stack:** Node.js, Express, Prisma ORM, SQLite (ambiente dev/teste), JWT.
   - **Estado:** Banco de dados modelado e atualizado recentemente (Tickets e Allowlist V2). Controladores básicos para tickets, staff, rotas de internal/webhook implementados.

3. **Bot Engine (Node.js / Discord.js)**
   - **Papel:** Interação direta com os usuários e servidores no Discord. Atua apenas como "braço executor" e interface (I/O).
   - **Stack:** Node.js, Discord.js v14, TypeScript.
   - **Estado:** Estrutura modular limpa de comandos (`/ping`, `/allowlist`, moderação) e eventos (`interactionCreate`, `guildMemberAdd`). Utiliza um `ApiClient` para extrair decisões lógicas e fluxos de negócio da Core API.

---

## 🛠️ 2. Módulos Implementados

### 2.1. Funcionalidades Base
- **Sincronização de Servidores:** O bot notifica a Core API ao entrar ou sair de um servidor (GuildCreate/GuildDelete), que marca a guild como ativa ou inativa.
- **Moderação Básica:** Comandos de `/kick`, `/ban`, `/warn` e `/mute`. O bot aplica as penas e avisa a Core API através do log via `internalController`.
- **Dashboard - Hub Central:** Visualização das estatísticas principais da Organização, quantidade de tickets em um período de 24h, staff logada e listagem rápida.

### 2.2. Ticket System V1
- **Estruturação de Dados:** Models criados no Prisma (`TicketPortal`, `TicketButton`, `TicketTemplate`, `Ticket`, etc).
- **Core API:** Endpoints para criar Portais, listar Templates e tratar requisições internas formadas pelo Bot (Tickets Abertos/Fechados).
- **Dashboard UI:**
  - Tela da Lista de Tickets dinâmica (conectada à API via `useTickets`).
  - Telas estruturais (mockadas visualmente) para `Portais` (Hubs) e `Formulários` (Templates), unidas num sub-layout com navegação flexível em `/tickets`.
- **Bot Engine Fluxo Misto:** Já foi preparado o evento e Modal básico de Tickets no bot, enviando informações do subject para a Core API e abrindo canais dedicados baseados na interação padrão.

### 2.3. Allowlist V2 (O mais recente)
- **Desacoplamento Completo:** A allowlist foi removida de `process.env` globais e agora é granular e gerenciada por Guild/Organização.
- **Estruturação de Dados:** Models criados (`AllowlistForm`, `AllowlistQuestion`, `AllowlistSubmission`, `AllowlistAnswer`). Suporta fluxos *Simple* ou *Advanced* e Auto-Aprovação.
- **Core API Controller:** Endpoint `GET /internal/allowlist/active-form` para injetar perguntas, e `POST .../submit` contendo lógicas anti-flood (bloquear múltiplas `pending`).
- **Bot Engine (Fluxo Dinâmico):** Módulo `/allowlistV2` totalmente criado. O comando gera Modais dinamarques baseados no tipo das perguntas retornadas (Short/Long Text) no backend, renderizando até 5 variáveis com salvamento persistente na API. O bot exibe _verde_ (aprovado) ou _vermelho_ (reprovado) baseado no retorno de submissão.

---

## 🔍 3. Análise Crítica do Estado Atual

### ✅ Pontos Fortes (O que está muito bom)
- **Isolamento de Domínio (Separation of Concerns):** A arquitetura entre o Bot Engine e a Core API está firme e muito bem isolada. Se o bot reiniciar ou o websocket cair, as regras de negócios e formulários não se perdem. 
- **Design de Banco de Dados:** O Schema Prisma está muito escalável. Relacionar tudo a "Server" e "Organization" preparou o terreno perfeitamente para planos pagos Multi-Tenant sem dores de cabeça estruturais futuras.
- **Visual do Dashboard:** O UI construído no Next.js apresenta alta qualidade e modernidade, mantendo uma experiência limpa (Design System focado e animações suaves).

### ⚠️ Pontos Fracos & Desafios Imediatos
- **Mocks na UI de Criação:** Apesar das telas de listagem de "Portais/Templates" de Ticket e de "Formulários" Allowlist existirem e estarem mapeadas no Schema, o Dashboard ainda não possuí as telas (Builders) onde de fato o usuário clica e **CRIA/EDITA** esses campos. (É o elo fraco da cadeia para testar End-to-End).
- **Falsa Sensação de Conexão no Dashboard:** O Dashboard ainda utiliza um sistema de simulação de Login `mockDiscordLogin` (Mock login endpoint). Não existe OAuth de fato funcional com o Discord ainda.
- **Segurança da Auth Bot:** O middleware interno de segurança `x-internal-service-key` foi desenhado nas rotas da Core API, mas é crucial garantir que cada chamada da API do Bot Engine propague corretamente essa Secret Key, evitando rotas expostas.

---

## 🚀 4. Próximos Passos Recomendados (Roadmap Curto Prazo)

Para que o SaaSBot possa ser comercializável e totalmente gerenciável pelas organizações (Tenants), as prioridades são:

**1. Modal Builders e Criação via Dashboard (Prioridade Máxima)**
Criar os formulários reais no Frontend onde o usuário clica em "Criar Portal" / "Criar Template de Ticket" ou "Criar Form de Allowlist" e os envia via Axios (POST/PATCH) para as rotas CRUD que já existem (ou que implementaremos) na Core API. Sem isso, a configuração requer inserção direta no banco dev.

**2. Staff Review (Gestão Submissões de Allowlist)**
Criar a página final do Dashboard para a aprovação das _Allowlist Submissions_, permitindo o dono ou a equipe ler os questionários preenchidos dentro da plataforma e alterar o Status para `approved` / `rejected`.

**3. Renderizador Completo de Tickets do Bot**
Integrar as chamadas CRUD finais no Bot Engine para que ele não mande apenas um modal fixo no `/open_ticket`, e sim baixe o array do layout dos Portais dinamicamente. Mapear botões de Success, Danger, com Emojis da tabela do BD.

**4. Bot "Action Triggers" (Core API -> Bot)**
Criar uma Webhook (ou WebSocket reversa) para que assim que uma `Submission` for aprovada ou um "Portal Atualizado" via Dashboard, o Node.js da Core API dispare uma ordem pro Bot Engine agir instantaneamente ali no canal do Discord.
