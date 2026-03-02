# 🛠️ Plano de Correção — Auditoria Técnica `orbitos`

> **Data da auditoria:** 2026-03-02
> **Auditado por:** GitHub Copilot
> **Status geral:** 🔴 10 problemas identificados (3 críticos, 4 altos, 2 médios, 1 baixo)

---

## Índice

1. [🔴 CRÍTICO — `import` estático no meio de `server.ts`](#1-crítico--import-estático-no-meio-de-serverts)
2. [🔴 CRÍTICO — `whereClause: any` em `auth.controller.ts`](#2-crítico--whereclause-any-em-authcontrollerts)
3. [🔴 CRÍTICO — JWT sem verificação de assinatura no middleware Next.js](#3-crítico--jwt-sem-verificação-de-assinatura-no-middleware-nextjs)
4. [🟠 ALTO — `import` após código e heartbeat antes do login em `bot-engine/index.ts`](#4-alto--import-após-código-e-heartbeat-antes-do-login-em-bot-engineindexts)
5. [🟠 ALTO — `setTimeout` frágil para deleção de canal](#5-alto--settimeout-frágil-para-deleção-de-canal)
6. [🟠 ALTO — `node_modules` do bot-engine commitado no Git](#6-alto--node_modules-do-bot-engine-commitado-no-git)
7. [🟡 MÉDIO — Credenciais hardcoded em `docker-compose.yml`](#7-médio--credenciais-hardcoded-em-docker-composeyml)
8. [🟡 MÉDIO — `TicketService` importado mas nunca usado](#8-médio--ticketservice-importado-mas-nunca-usado)
9. [🟡 MÉDIO — `isPublicPath()` declarada mas nunca chamada](#9-médio--ispublicpath-declarada-mas-nunca-chamada)
10. [🟢 BAIXO — Arquivos de debug commitados](#10-baixo--arquivos-de-debug-commitados)

---

## 1. 🔴 CRÍTICO — `import` estático no meio de `server.ts`

**Arquivo:** `core-api/src/server.ts` — linha 54

### Problema

O `import` do `WebhookController` está localizado no meio do arquivo, após blocos de código executável (`app.use(cors(...))`). Em TypeScript/ESModules, imports estáticos **devem sempre estar no topo do arquivo**. Isso causa erro de compilação com `tsc` e comportamento indefinido em runtime.

```typescript
// ❌ ERRADO — import no meio do arquivo
app.use(cors({ ... }));
import { WebhookController } from './controllers/webhook.controller'; // LINHA 54
app.use(express.json());
```

### Correção

Mover **todos os imports** para o topo do arquivo, antes de qualquer código executável:

```typescript
// ✅ CORRETO — todos os imports no topo
import express from 'express';
import cors from 'cors';
import http from 'http';
import 'express-async-errors';
import { WebhookController } from './controllers/webhook.controller'; // ← MOVER AQUI

import authRoutes from './routes/auth.routes';
// ... demais imports ...

const app = express();
// ... resto do código ...
```

### Checklist de Conclusão

- [ ] Mover `import { WebhookController }` para o topo de `server.ts`
- [ ] Rodar `tsc --noEmit` para confirmar que não há erros de compilação
- [ ] Testar a rota `/webhook/stripe` manualmente após a mudança

---

## 2. 🔴 CRÍTICO — `whereClause: any` em `auth.controller.ts`

**Arquivo:** `core-api/src/controllers/auth.controller.ts` — linha 100

### Problema

O método `oauthLogin` usa `whereClause: any = {}`. Se a validação de `provider` falhar silenciosamente ou for burlada, o `whereClause` ficará vazio `{}` e o `prisma.user.findFirst({ where: {} })` retornará **o primeiro usuário do banco de dados**, permitindo login como qualquer usuário — incluindo `SUPER_ADMIN`.

```typescript
// ❌ VULNERÁVEL
const whereClause: any = {};
if (provider === 'discord') whereClause.discordId = providerUserId;
if (provider === 'google')  whereClause.googleId  = providerUserId;
if (provider === 'github')  whereClause.githubId  = providerUserId;

user = await prisma.user.findFirst({ where: whereClause }); // whereClause pode ser {}!
```

### Correção

Tipar corretamente e garantir que o `whereClause` nunca esteja vazio antes de executar a query:

```typescript
// ✅ SEGURO
type ProviderWhereClause =
    | { discordId: string }
    | { googleId: string }
    | { githubId: string };

let whereClause: ProviderWhereClause;

if (provider === 'discord') {
    whereClause = { discordId: providerUserId };
} else if (provider === 'google') {
    whereClause = { googleId: providerUserId };
} else if (provider === 'github') {
    whereClause = { githubId: providerUserId };
} else {
    return res.status(400).json({ error: 'Provider inválido.' });
}

user = await prisma.user.findFirst({ where: whereClause });
```

> **Nota:** A validação de `validProviders` existente não é suficiente porque o TypeScript não infere o tipo de `whereClause` após ela, e um refactor futuro pode quebrar essa lógica silenciosamente.

### Checklist de Conclusão

- [ ] Substituir `whereClause: any` pelo tipo union discriminado
- [ ] Adicionar `else` final que retorna 400 se nenhum provider for matched
- [ ] Escrever teste de integração que tente fazer login com `provider` vazio

---

## 3. 🔴 CRÍTICO — JWT sem verificação de assinatura no middleware Next.js

**Arquivo:** `src/middleware.ts` — linhas 56–66

### Problema

O middleware do Next.js apenas **decodifica** o payload Base64 do JWT, sem verificar a assinatura criptográfica. Qualquer pessoa pode gerar um JWT manualmente com `role: 'SUPER_ADMIN'` e acessar as rotas `/platform`.

```typescript
// ❌ INSEGURO — apenas decodifica, não verifica assinatura
const payload = JSON.parse(atob(token.split('.')[1] || ''));
role = payload.role || 'USER';
```

### Contexto

O middleware roda no **Edge Runtime** do Next.js, que não suporta `jsonwebtoken` (Node.js). Por isso a verificação completa não é feita ali. A proteção real **deve acontecer na `core-api`**, mas é preciso garantir que:

1. Toda rota de `/platform` verifique o token na `core-api` antes de servir dados
2. Não existam páginas server-side que exponham dados de SUPER_ADMIN apenas com base no role do cookie

### Correção Recomendada

**Opção A — Verificação com `jose` (compatível com Edge):**

```bash
npm install jose
```

```typescript
// ✅ Verificação de assinatura no Edge com `jose`
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

try {
    const { payload } = await jwtVerify(token, secret);
    role = (payload.role as string) || 'USER';
} catch {
    tokenValid = false;
}
```

**Opção B (mínima) — Adicionar comentário de risco e documentar que a verificação real ocorre na API:**

Adicionar comentário explícito no código e garantir que cada Server Component / API Route em `/platform` valide o token via `core-api` antes de retornar dados.

### Checklist de Conclusão

- [ ] Instalar `jose` e substituir o `atob` por `jwtVerify`
- [ ] Adicionar `JWT_SECRET` às variáveis de ambiente do Next.js (`.env.local`)
- [ ] Verificar que todas as rotas de `/platform` validam o JWT server-side
- [ ] Testar com um JWT forjado para confirmar que o acesso é bloqueado

---

## 4. 🟠 ALTO — `import` após código e heartbeat antes do login em `bot-engine/index.ts`

**Arquivo:** `bot-engine/src/index.ts` — linhas 40–59

### Problema A: `import` estático fora do topo

```typescript
// ❌ import estático no meio do arquivo
setInterval(async () => { ... }, 5 * 60 * 1000);

import { communityWSClient } from './services/ws-client'; // ← linha 53, ERRADO
```

### Problema B: Heartbeat dispara antes do bot estar online

O `setInterval` começa imediatamente na inicialização. Nos primeiros 5 minutos, `client.uptime` pode ser `null` e `client.ws.ping` pode ser `-1` (bot não logado ainda), enviando dados inválidos para a `core-api`.

### Correção

```typescript
// ✅ CORRETO — imports todos no topo
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { loadEvents } from './handlers/event-handler';
import { loadCommands } from './handlers/command-handler';
import { log } from './utils/logger';
import coreApi from './utils/api-client';
import { communityWSClient } from './services/ws-client'; // ← MOVER PARA CÁ

dotenv.config();

// ... validação do token e setup do client ...

loadCommands(client);
loadEvents(client);

log.info('Conectando ao Discord...');

client.login(DISCORD_TOKEN).then(() => {
    // ✅ WS Client e Heartbeat só iniciam APÓS o login com sucesso
    communityWSClient.init(client);

    setInterval(async () => {
        try {
            await coreApi.post('/internal/heartbeat', {
                guilds: client.guilds.cache.size,
                uptime: client.uptime,
                ping: client.ws.ping,
            });
            log.info(`💓 Heartbeat enviado. Guilds: ${client.guilds.cache.size} | WS Ping: ${client.ws.ping}ms`);
        } catch {
            log.warn('Heartbeat falhou — Core API pode estar offline.');
        }
    }, 5 * 60 * 1000);
});
```

### Checklist de Conclusão

- [ ] Mover `import { communityWSClient }` para o topo do arquivo
- [ ] Mover o `setInterval` do heartbeat para dentro do `.then()` do `client.login()`
- [ ] Testar o bot reiniciando e verificando que o heartbeat só aparece após "Logged in as..."

---

## 5. 🟠 ALTO — `setTimeout` frágil para deleção de canal

**Arquivo:** `core-api/src/controllers/ticket.controller.ts` — linhas 213–220

### Problema

```typescript
// ❌ FRÁGIL — se o processo reiniciar em 5s, o canal nunca é deletado
setTimeout(() => {
    discordDriver.execute({ action: 'delete_channel', ... });
}, 5000);
```

O `setTimeout` é perdido em qualquer reinício do processo (deploy, crash, OOM). O canal do Discord ficará orphan para sempre.

### Correção Recomendada

**Opção A — Delegar para o Bot Engine via WebSocket com confirmação:**

Enviar um comando `close_ticket_channel` ao bot com um delay configurável, e deixar o bot responsável por aplicar o delay e a deleção (o bot pode persistir essa intenção se necessário).

**Opção B — Usar uma job queue (BullMQ/pg-boss):**

```typescript
// ✅ Com BullMQ
import { Queue } from 'bullmq';

const channelDeletionQueue = new Queue('channel-deletion', { connection: redisConnection });

await channelDeletionQueue.add('delete', {
    serverId: ticket.server.discordGuildId,
    channelId: ticket.channelId,
}, { delay: 5000 });
```

**Opção C (mínima) — Deixar o bot deletar imediatamente após o aviso:**

O bot detecta a mensagem de encerramento e agenda a deleção internamente, onde pode fazer retry em caso de falha.

### Checklist de Conclusão

- [ ] Decidir estratégia: job queue vs. delegação ao bot
- [ ] Implementar e testar deleção de canal com reinício do servidor no meio do delay
- [ ] Adicionar log de confirmação quando o canal for efetivamente deletado

---

## 6. 🟠 ALTO — `node_modules` do bot-engine commitado no Git

**Afeta:** Repositório inteiro (69MB de tamanho)

### Problema

O diretório `bot-engine/node_modules/` está sendo rastreado pelo Git. Isso:
- Aumenta dramaticamente o tamanho do clone (centenas de MB)
- Causa conflitos de merge desnecessários
- Expõe versões exatas de dependências internas de terceiros

### Correção

```bash
# 1. Remover do rastreamento Git (não apaga os arquivos locais)
git rm -r --cached bot-engine/node_modules/

# 2. Commit da remoção
git commit -m "chore: remove bot-engine/node_modules from git tracking"

# 3. Push
git push origin main
```

**Adicionar ao `.gitignore` raiz (ou criar `bot-engine/.gitignore`):**

```gitignore
# Adicionar ao .gitignore
bot-engine/node_modules/
core-api/node_modules/
node_modules/
```

### Checklist de Conclusão

- [ ] Rodar `git rm -r --cached bot-engine/node_modules/`
- [ ] Verificar que `bot-engine/node_modules/` está no `.gitignore`
- [ ] Confirmar que `npm install` dentro de `bot-engine/` restaura tudo corretamente
- [ ] Verificar se `core-api/node_modules/` também precisa ser removido

---

## 7. 🟡 MÉDIO — Credenciais hardcoded em `docker-compose.yml`

**Arquivo:** `docker-compose.yml`

### Problema

```yaml
# ❌ Credenciais em texto puro
environment:
  POSTGRES_USER: orbitos
  POSTGRES_PASSWORD: orbitos_dev
  POSTGRES_DB: orbitos_core
```

### Correção

**Criar `.env` na raiz do projeto:**

```env
# .env (adicionar ao .gitignore!)
POSTGRES_USER=orbitos
POSTGRES_PASSWORD=sua_senha_segura_aqui
POSTGRES_DB=orbitos_core
```

**Atualizar `docker-compose.yml`:**

```yaml
# ✅ Usando variáveis de ambiente
environment:
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  POSTGRES_DB: ${POSTGRES_DB}
```

**Criar `.env.example` para documentar:**

```env
# .env.example (COMMITAR este arquivo, não o .env)
POSTGRES_USER=orbitos
POSTGRES_PASSWORD=TROCAR_AQUI
POSTGRES_DB=orbitos_core
```

### Checklist de Conclusão

- [ ] Criar `.env` com as credenciais reais
- [ ] Adicionar `.env` ao `.gitignore`
- [ ] Criar `.env.example` com valores placeholder
- [ ] Atualizar `docker-compose.yml` para usar `${VAR}`
- [ ] Testar `docker compose up` após a mudança

---

## 8. 🟡 MÉDIO — `TicketService` importado mas nunca usado

**Arquivo:** `core-api/src/controllers/ticket.controller.ts` — linhas 2 e 6

### Problema

```typescript
// ❌ Importado e instanciado mas nunca chamado
import { TicketService } from '../services/domain/ticket.service';
const ticketService = new TicketService();
```

### Ação Necessária

Duas opções:

**A) Remover se for código morto:**
```typescript
// Remover as duas linhas acima
```

**B) Migrar a lógica de Prisma do controller para o service (recomendado):**

O padrão correto é que a lógica de banco de dados fique no `TicketService`, e o controller apenas chame o service. Refatorar gradualmente para:

```typescript
// ✅ Controller delega para o Service
async listMyTickets(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Não autorizado.' });

    const tickets = await ticketService.listForUser(userId);
    return res.json(tickets);
}
```

### Checklist de Conclusão

- [ ] Decidir: remover `TicketService` ou migrar lógica para ele
- [ ] Implementar a decisão escolhida
- [ ] Rodar `tsc --noEmit` para confirmar sem erros

---

## 9. 🟡 MÉDIO — `isPublicPath()` declarada mas nunca chamada

**Arquivo:** `src/middleware.ts` — linhas 8–12

### Problema

```typescript
// ❌ Função definida mas nunca usada
function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
}
```

### Correção

**Opção A — Usar a função na lógica do middleware:**

```typescript
// ✅ Usar isPublicPath para simplificar a lógica
if (!token && !isPublicPath(pathname) && isProtected) {
    // redirecionar para login
}
```

**Opção B — Remover se não for necessária:**

```typescript
// Deletar as linhas 6-12 (PUBLIC_PATHS e isPublicPath)
```

> **Nota:** Atualmente o `matcher` do middleware já limita as rotas interceptadas, então `isPublicPath` pode ser desnecessária. Avaliar antes de usar.

### Checklist de Conclusão

- [ ] Avaliar se `isPublicPath` é útil dado o `matcher` atual
- [ ] Usar a função ou remover o código morto

---

## 10. 🟢 BAIXO — Arquivos de debug commitados

**Arquivos:** `core-api/src/check_db.ts`, `core-api/src/test_api.ts`

### Problema

Esses arquivos são scripts de debug/verificação manual que:
- Consultam **todos os dados** do banco em produção
- Não têm proteção de acesso
- Poluem o source code com código que não faz parte da aplicação

### Correção

```bash
# Mover para pasta de scripts (não incluída no build)
mkdir -p core-api/scripts
git mv core-api/src/check_db.ts core-api/scripts/check_db.ts
git mv core-api/src/test_api.ts core-api/scripts/test_api.ts
```

**Adicionar ao `.gitignore` se preferir não commitar:**

```gitignore
core-api/scripts/
```

**Ou manter na pasta `/scripts` mas documentar:**

```json
// Adicionar ao package.json do core-api
"scripts": {
    "db:check": "tsx scripts/check_db.ts",
    "db:test": "tsx scripts/test_api.ts"
}
```

### Checklist de Conclusão

- [ ] Mover `check_db.ts` e `test_api.ts` para `core-api/scripts/`
- [ ] Atualizar `package.json` com scripts para executá-los
- [ ] Confirmar que não são importados em nenhum lugar do código principal

---

## Resumo de Progresso

| # | Problema | Prioridade | Status |
|---|---|---|---|
| 1 | `import` estático no meio de `server.ts` | 🔴 Crítico | ⬜ Pendente |
| 2 | `whereClause: any` em `auth.controller.ts` | 🔴 Crítico | ⬜ Pendente |
| 3 | JWT sem verificação de assinatura | 🔴 Crítico | ⬜ Pendente |
| 4 | `import` + heartbeat antes do login no bot | 🟠 Alto | ⬜ Pendente |
| 5 | `setTimeout` frágil para deleção de canal | 🟠 Alto | ⬜ Pendente |
| 6 | `node_modules` commitado no Git | 🟠 Alto | ⬜ Pendente |
| 7 | Credenciais hardcoded no docker-compose | 🟡 Médio | ⬜ Pendente |
| 8 | `TicketService` nunca usado | 🟡 Médio | ⬜ Pendente |
| 9 | `isPublicPath()` nunca chamada | 🟡 Médio | ⬜ Pendente |
| 10 | Arquivos de debug no repositório | 🟢 Baixo | ⬜ Pendente |

---

*Gerado automaticamente por GitHub Copilot em 2026-03-02*