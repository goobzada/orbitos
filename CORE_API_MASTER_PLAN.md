# 🧠 CORE API — MASTER PLAN
## Backend Central do SaaSBot

Este projeto será a API REST principal e única fonte da verdade para o SaaS. Tanto o **Dashboard Web** quanto o **Bot Engine (Discord)** farão requisições HTTP para esta API. Nenhuma regra de negócio deve residir no frontend ou no bot.

---

## 1️⃣ STACK TECNOLÓGICA
- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework REST:** Express.js (com `express-async-errors`)
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Validação de Dados:** Zod
- **Autenticação:** JSON Web Tokens (JWT) + Discord OAuth2

---

## 2️⃣ ARQUITETURA DE DIRETÓRIOS (Clean/Modular)

```text
core-api/
 ├── prisma/
 │    └── schema.prisma        # Modelagem do Banco de Dados
 ├── src/
 │    ├── config/              # Variáveis de ambiente (env), setup do servidor
 │    ├── controllers/         # Regras HTTP (Req, Res)
 │    ├── middlewares/         # Autenticação, Tratamento de Erros globais
 │    ├── routes/              # Definição dos endpoints REST
 │    ├── services/            # Regras de Negócio, chamadas ao Prisma
 │    ├── utils/               # Funções de ajuda (Helpers, JWT, Hash)
 │    └── server.ts            # Ponto de entrada da aplicação
 ├── .env
 ├── package.json
 └── tsconfig.json
```

---

## 3️⃣ MODELAGEM DO BANCO DE DADOS (PRISMA)

Abaixo estão as tabelas essenciais para um SaaS B2B Multi-tenant focado no Discord:

### 👤 `User` (Usuários logados no Dashboard)
- `id` (UUID)
- `discordId` (String, UQ)
- `username` (String)
- `avatar` (String)
- `email` (String)
- `role` (Enum: SUPER_ADMIN, USER)
- `createdAt` / `updatedAt`

### 🏢 `Organization` (Os "Tenants", empresas/donos do SaaS)
- `id` (UUID)
- `name` (String)
- `ownerId` (FK User)
- `planId` (Enum: FREE, PRO, ENTERPRISE)
- `stripeCustomerId` (String)
- `createdAt` / `updatedAt`

### 🖥 `Server` (Guilds do Discord conectados na Org)
- `id` (UUID)
- `discordGuildId` (String, UQ)
- `name` (String)
- `icon` (String)
- `organizationId` (FK Organization)
- `isActive` (Boolean) - Bot está no servidor?
- `config` (JSON) - Configurações de categorias, roles staff, logs
- `createdAt` / `updatedAt`

### 👥 `StaffMember` (A equipe gerida dentro de um servidor)
- `id` (UUID)
- `serverId` (FK Server)
- `discordUserId` (String)
- `username` (String)
- `role` (Enum: ADMIN, MODERATOR, HELPER)
- Tabelas associadas: `ticketsResolved`, `punishments`
- `createdAt` / `updatedAt`

### 🎫 `Ticket` (Sistema de Atendimento)
- `id` (UUID)
- `serverId` (FK Server)
- `authorId` (String) - Quem abriu o ticket no Discord
- `channelId` (String) - Canal criado no Discord
- `status` (Enum: OPEN, IN_PROGRESS, CLOSED)
- `createdAt` / `updatedAt`

---

## 4️⃣ ROTAS (ENDPOINTS) PREVISTOS

**🔑 Autenticação**
- `GET /auth/discord` (Redireciona para o Discord)
- `GET /auth/discord/callback` (Gera JWT)
- `GET /auth/me` (Dados do usuário logado)

**🏢 Organizações & Pagamentos**
- `POST /organizations` (Criar tenant)
- `GET /organizations/me` (Listar minhas orgs)
- `GET /billing/subscription` (Dados do plano na Stripe)

**🖥 Servidores**
- `GET /servers` (Lista servidores da Org atual)
- `POST /servers` (Vincula um bot a um novo GuildID)
- `PATCH /servers/:id/config` (Salva logChannel, staffRoles, host FiveM)

**👥 Staff**
- `GET /servers/:id/staff` (Lista equipe e performance)
- `POST /servers/:id/staff` (Adiciona membro)
- `DELETE /servers/:id/staff/:staffId` (Remove membro)

**🎫 Tickets**
- `GET /servers/:id/tickets` (Dashboard puxa o histórico geral)
- `POST /webhooks/tickets` (O Bot Engine notifica quando abre ticket lá)
- `PATCH /tickets/:id/close` (Fecha pelo Dashboard)

---

## 5️⃣ FLUXO DE TRABALHO (NEXT STEPS)

1. **Setup Inicial:** Criar `package.json`, instalar TypeScript, Express e Prisma.
2. **Schema do Prisma:** Escrever o `schema.prisma` com os models e tabelas relacionais e usar o SQLite (temporariamente) ou Docker Postgre.
3. **Middlewares:** Criar o sistema de Autenticação JWT e Error Handler.
4. **Controllers & Rotas:** Fazer o CRUD de Servidores e Organizações.
5. **Testes:** Criar tudo modular para que possa integrar o Dashboard.
