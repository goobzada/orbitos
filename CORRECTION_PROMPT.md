# Prompt de Correção — Orbitos

> **Instruções de uso:** Copie o bloco abaixo e cole diretamente em uma sessão de assistente de IA (GitHub Copilot Chat, Claude, ChatGPT, etc.) para guiar a correção sistemática do codebase.

---

## PROMPT DE CORREÇÃO DO PROJETO ORBITOS

```
Você é um engenheiro de software sênior especializado em TypeScript, Node.js, Next.js
e segurança de aplicações SaaS. Analise o projeto Orbitos — uma plataforma de
automação de comunidades Discord com três serviços (frontend Next.js, core-api
Express, bot-engine Discord.js) — e aplique as correções abaixo, arquivo por
arquivo, na ordem de prioridade listada.

Regras gerais:
1. Não mude a funcionalidade existente; corrija apenas os problemas listados.
2. Prefira soluções minimalistas que alterem o menor número de linhas possível.
3. Para cada arquivo modificado, adicione um comentário /* FIX: <descrição> */
   apenas quando a alteração não for óbvia.
4. Ao final, forneça um resumo de todos os arquivos alterados.

─────────────────────────────────────────────────────────────────────────────
P0 — CRÍTICO (Segurança): deve ser resolvido ANTES de qualquer deploy
─────────────────────────────────────────────────────────────────────────────

CORREÇÃO 1 — Remover fallback de segredos hardcoded

  Arquivos:
    • core-api/src/middlewares/auth.middleware.ts  (linha ~9)
    • core-api/src/controllers/auth.controller.ts  (linha ~19)
    • bot-engine/src/index.ts                      (linha ~14)
    • src/middleware.ts                            (linha ~47)

  Problema:
    Todos os arquivos acima usam o padrão:
      const SECRET = process.env.SOME_VAR || 'hardcoded-fallback';
    O fallback hardcoded pode vazar para produção caso a variável não esteja
    definida, comprometendo toda a autenticação JWT.

  Correção esperada:
    - Em auth.middleware.ts: se JWT_SECRET for undefined/vazio em QUALQUER
      ambiente, lançar um Error em vez de usar o fallback.
    - Em auth.controller.ts: idem — RESOLVED_SECRET nunca deve conter a string
      'dev-jwt-secret-do-not-use-in-production'.
    - Em src/middleware.ts linha 47: substituir o fallback pelo lançamento de
      um erro de configuração.
    - Em bot-engine/src/index.ts: o processo já chama process.exit(1) para
      DISCORD_TOKEN; aplicar o mesmo padrão para DISCORD_CLIENT_ID.

  Exemplo de padrão seguro:
    if (!process.env.JWT_SECRET) {
      throw new Error('[CONFIG] JWT_SECRET é obrigatório em todos os ambientes.');
    }
    const JWT_SECRET = process.env.JWT_SECRET;


CORREÇÃO 2 — Validar assinatura Stripe em todos os cenários

  Arquivo: core-api/src/controllers/webhook.controller.ts  (linha ~20-30)

  Problema:
    Se STRIPE_WEBHOOK_SECRET ou o header stripe-signature estiverem ausentes,
    o código faz um JSON.parse(payload) sem validação, permitindo eventos
    forjados.

  Correção esperada:
    Substituir o bloco if/else por:
      if (!endpointSecret || !sig) {
        return res.status(400).json({ error: 'Webhook não assinado.' });
      }
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    Remover o fallback de parse sem assinatura.


CORREÇÃO 3 — Tipar acessos a campos do Stripe

  Arquivo: core-api/src/controllers/webhook.controller.ts  (linha ~40)

  Problema: (invoice as any).subscription contorna o type-checker.

  Correção esperada:
    Usar a propriedade tipada do SDK do Stripe:
      const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;
    Ou usar a guarda de tipo:
      if ('subscription' in invoice && typeof invoice.subscription === 'string') { ... }


CORREÇÃO 4 — Restringir CORS no ambiente de desenvolvimento

  Arquivo: core-api/src/server.ts  (linha ~57-58)

  Problema:
    A condição `origin?.startsWith('http://localhost')` permite QUALQUER porta
    de localhost. Isso abre brecha para ferramentas de teste rodando em portas
    inesperadas acessarem a API autenticada.

  Correção esperada:
    Substituir a condição genérica por uma lista explícita de portas permitidas
    em dev:
      const DEV_LOCALHOST_PORTS = [3000, 3001, 4000];
      const isLocalhost = DEV_LOCALHOST_PORTS.some(
        p => origin === `http://localhost:${p}` || origin === `http://127.0.0.1:${p}`
      );

─────────────────────────────────────────────────────────────────────────────
P1 — ALTA (Confiabilidade e Performance)
─────────────────────────────────────────────────────────────────────────────

CORREÇÃO 5 — Singleton do Prisma Client

  Arquivo: core-api/src/lib/prisma.ts

  Problema:
    `new PrismaClient()` é executado a cada hot-reload em desenvolvimento,
    criando múltiplas conexões simultâneas ao banco.

  Correção esperada:
    import { PrismaClient } from '@prisma/client';

    const globalForPrisma = global as unknown as { prisma: PrismaClient };

    export const prisma =
      globalForPrisma.prisma ?? new PrismaClient({ log: ['warn', 'error'] });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }

    export default prisma;


CORREÇÃO 6 — Adicionar paginação nos endpoints que usam findMany ilimitado

  Arquivos (todos com findMany sem skip/take):
    core-api/src/controllers/ticket.controller.ts         → listMyTickets
    core-api/src/controllers/automation.controller.ts     → listAutomations + listLogs
    core-api/src/controllers/org.controller.ts            → listOrganizations + listTemplates
    core-api/src/controllers/server.controller.ts         → listServers
    core-api/src/controllers/staff.controller.ts          → listStaff
    core-api/src/controllers/stats.controller.ts          → orders, activities
    core-api/src/controllers/ticket-portal.controller.ts  → listPortals
    core-api/src/controllers/ticket-template.controller.ts → listTemplates

  Correção esperada para cada endpoint:
    1. Extrair page e limit da query string:
         const page  = Math.max(1, parseInt(String(req.query.page  ?? 1)));
         const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 50))));
    2. Adicionar skip e take no findMany:
         skip: (page - 1) * limit,
         take: limit,
    3. Incluir total na resposta:
         const [data, total] = await prisma.$transaction([
           prisma.<model>.findMany({ ..., skip, take }),
           prisma.<model>.count({ where }),
         ]);
         return res.json({ data, total, page, limit });


CORREÇÃO 7 — Substituir fs.readdirSync por versão assíncrona

  Arquivos:
    bot-engine/src/handlers/command-handler.ts  (linha ~18)
    bot-engine/src/handlers/event-handler.ts    (linha ~8)
    bot-engine/src/index.ts                     (linha ~57 — dentro de autoDeployCommands)

  Problema: readdirSync bloqueia o event loop durante o startup.

  Correção esperada:
    Converter loadCommands, loadEvents e o bloco de autoDeployCommands para
    async/await usando fs.promises.readdir().


CORREÇÃO 8 — Adicionar try/catch no carregamento de módulos do bot

  Arquivo: bot-engine/src/handlers/command-handler.ts  (linha ~22)

  Problema: require() sem try/catch falha silenciosamente se o arquivo tiver
    erro de sintaxe ou módulo corrompido.

  Correção esperada:
    for (const file of commandFiles) {
      try {
        const command = require(path.join(commandsPath, file)).default;
        if (command?.data && command?.execute) {
          client.commands.set(command.data.name, command);
          count++;
        }
      } catch (err) {
        log.error(`[COMMANDS] Falha ao carregar ${file}: ${(err as Error).message}`);
      }
    }

  Aplicar o mesmo padrão em event-handler.ts para o carregamento de eventos.


CORREÇÃO 9 — Awaitar ou encadear .catch() em autoDeployCommands

  Arquivo: bot-engine/src/index.ts  (linha ~98)

  Problema:
    autoDeployCommands(); // chamado sem await ou .catch()
    Rejeições de Promise silenciosas podem mascarar falhas de deploy de comandos.

  Correção esperada:
    autoDeployCommands().catch(err =>
      log.warn(`[COMMANDS] Auto-deploy falhou: ${(err as Error).message}`)
    );

─────────────────────────────────────────────────────────────────────────────
P2 — MÉDIA (Qualidade de Código e Manutenibilidade)
─────────────────────────────────────────────────────────────────────────────

CORREÇÃO 10 — Eliminar o uso de `any` nos tipos de Request/User

  Arquivos afetados (os mais críticos):
    core-api/src/middlewares/auth.middleware.ts
    core-api/src/controllers/auth.controller.ts
    core-api/src/controllers/ticket.controller.ts
    core-api/src/controllers/org.controller.ts

  Problema: (req as any).user?.id  e  req.user?.id  sem tipo definido causam
    erros de runtime não detectados pelo compilador.

  Correção esperada:
    1. Criar o arquivo core-api/src/types/express.d.ts com:
         import { Request } from 'express';

         declare global {
           namespace Express {
             interface Request {
               user?: {
                 id: string;
                 discordId?: string;
                 role: string;
                 username: string;
                 avatar?: string;
                 impersonatingOrgId?: string;
                 supportSessionId?: string;
               };
             }
           }
         }

    2. Substituir todas as ocorrências de (req as any).user por req.user
       nos controllers e middlewares.


CORREÇÃO 11 — Adicionar validação de entrada com Zod nos endpoints críticos

  Prioridade de endpoints (começar por estes):
    POST /auth/discord-callback  → validar { code: string }
    POST /tickets                → validar { subject, content, serverId, ... }
    POST /automations            → validar estrutura de action/trigger
    PATCH /servers/:id/config    → validar config (substituir JSON.parse livre)

  Correção esperada:
    1. Instalar Zod: cd core-api && npm install zod
    2. Para cada endpoint, criar um schema Zod no topo do controller:
         import { z } from 'zod';
         const CreateTicketSchema = z.object({
           subject: z.string().min(1).max(200),
           content: z.string().min(1).max(4000),
           serverId: z.string().uuid(),
           priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
         });
    3. Validar no início do handler:
         const parsed = CreateTicketSchema.safeParse(req.body);
         if (!parsed.success) {
           return res.status(400).json({ error: parsed.error.flatten() });
         }


CORREÇÃO 12 — Corrigir acesso a cookies com tipo correto

  Arquivo: core-api/src/middlewares/auth.middleware.ts  (linha ~26)

  Problema: const cookies = (req as any).cookies; contorna o tipo Request.

  Correção esperada (após instalar @types/cookie-parser e adicionar
  cookie-parser ao Express):
    const cookies: Record<string, string | undefined> = req.cookies ?? {};


CORREÇÃO 13 — Remover token duplicado (localStorage + cookie simultâneos)

  Arquivo: src/app/login/page.tsx  (linha ~38-40)

  Problema:
    O token é salvo em localStorage E em um cookie manualmente definido via
    document.cookie. Isso cria duas fontes da verdade que podem ficar
    dessincronizadas (por exemplo, cookie expirado mas localStorage válido).

  Correção esperada:
    Salvar o token APENAS em um cookie HttpOnly definido server-side via um
    endpoint de API (ex: POST /auth/session) com os atributos obrigatórios:
      - HttpOnly: true          → impede acesso via JavaScript (mitigação XSS)
      - Secure: true            → apenas HTTPS em produção
      - SameSite: 'lax'         → proteção contra CSRF
      - maxAge / expires        → expiração alinhada ao TTL do JWT
    Remover a linha localStorage.setItem('token', data.token).
    Remover a linha document.cookie = `token=...` (cookie definido manualmente
    via JS não é HttpOnly e pode ser lido por scripts maliciosos).
    O src/lib/api.ts já tem lógica para ler o cookie via interceptor;
    o localStorage deve ser removido de todas as referências.


CORREÇÃO 14 — Remover código de mock OAuth de arquivos de produção

  Arquivo: src/app/login/page.tsx

  Problema:
    handleOAuthLogin faz chamada a /auth/oauth-login com payload de mock
    (providerUserId aleatório, email falso). Se a rota /auth/oauth-login
    existir em produção, isso cria um vetor de criação de contas falsas.

  Correção esperada:
    - A rota /auth/oauth-login deve ser REMOVIDA de qualquer build de produção
      ou completamente desabilitada por múltiplas camadas de proteção:
        1. Verificar flag de ambiente: process.env.ENABLE_MOCK_AUTH !== 'true'
           → retornar 404 imediatamente se não ativado explicitamente.
        2. Validar um segredo de servidor no header da requisição:
             if (req.headers['x-mock-auth-secret'] !== process.env.MOCK_AUTH_SECRET) {
               return res.status(403).json({ error: 'Proibido.' });
             }
        3. Restringir ao IP da máquina de desenvolvimento (IP allowlist).
        4. Nunca fazer deploy de ENABLE_MOCK_AUTH=true em produção; garantir
           isso via checklist de CI/CD e revisão de PRs.
    - No frontend (src/app/login/page.tsx), envolver todo o handleOAuthLogin em:
        if (process.env.NEXT_PUBLIC_MOCK_AUTH !== 'true') {
          console.warn('Mock auth desabilitado.');
          return;
        }
    - Adicionar ENABLE_MOCK_AUTH e MOCK_AUTH_SECRET ao .env.example com
      valor vazio e comentário de aviso.


CORREÇÃO 15 — Adicionar Error Boundaries no frontend

  Arquivo: src/app/layout.tsx  (e sub-layouts de dashboard/platform)

  Problema:
    Não há Error Boundaries em nenhuma página do dashboard. Qualquer exceção
    de render derruba toda a UI sem fallback.

  Correção esperada:
    1. Criar src/components/error-boundary.tsx como classe React.Component
       com componentDidCatch e um fallback de UI amigável.
    2. Envolver o children do layout principal e dos layouts de dashboard
       e platform com <ErrorBoundary>.

─────────────────────────────────────────────────────────────────────────────
P3 — BAIXA (Melhorias de código e DX)
─────────────────────────────────────────────────────────────────────────────

CORREÇÃO 16 — Tipar a Collection de comandos no Discord.js

  Arquivo: bot-engine/src/handlers/command-handler.ts  (linha ~7)

  Problema: Collection<string, any> perde toda a segurança de tipo dos comandos.

  Correção esperada:
    1. Criar bot-engine/src/types/command.ts:
         import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
         export interface BotCommand {
           data: SlashCommandBuilder;
           execute: (interaction: ChatInputCommandInteraction, client: Client) => Promise<void>;
         }
    2. Substituir Collection<string, any> por Collection<string, BotCommand>
       no command-handler.ts e na declaração do módulo discord.js.


CORREÇÃO 17 — Usar fs.promises.readdir em vez de readdirSync nos scripts de deploy

  Arquivo: bot-engine/src/deploy-commands.ts

  Problema: fs.readdirSync bloqueia durante o script de deploy.
  Correção: converter para await fs.promises.readdir(...).


CORREÇÃO 18 — Adicionar log estruturado nas respostas de erro 500

  Arquivos: todos os controllers em core-api/src/controllers/

  Problema: blocos catch retornam mensagens genéricas sem logar o erro
    completo, dificultando debugging em produção.

  Correção esperada:
    Em cada bloco catch (error) {...}:
      console.error('[CONTROLLER:NomeController] Erro inesperado:', error);
      return res.status(500).json({
        error: 'Ocorreu um erro interno. Por favor, tente novamente.',
      });
    Nunca expor error.message ou stack trace diretamente na resposta HTTP.


─────────────────────────────────────────────────────────────────────────────
Checklist de entregáveis esperados após aplicar este prompt:
─────────────────────────────────────────────────────────────────────────────

Segurança:
  [ ] Nenhum segredo hardcoded em nenhum arquivo
  [ ] Webhook Stripe sempre valida assinatura
  [ ] CORS restrito a origens explícitas
  [ ] Mock OAuth protegido por flag de ambiente

Confiabilidade:
  [ ] Prisma usa singleton global
  [ ] Todos os findMany têm skip/take
  [ ] Carregamento de comandos/eventos do bot tem try/catch
  [ ] Nenhuma Promise rejeitada sem handler

Qualidade:
  [ ] req.user tipado via Express namespace augmentation
  [ ] Pelo menos os 4 endpoints críticos validados com Zod
  [ ] Sem uso de (req as any).user em nenhum controller
  [ ] Error Boundary em pelo menos o layout raiz
  [ ] Token armazenado em único lugar (cookie server-side)
```
