# 🛒 Store System — Relatório Técnico & Roadmap
> OrbitOS · Branch: `fix/security-billing` · Data: 06/03/2026

---

## ✅ O QUE EXISTE E FUNCIONA

### Backend (core-api)

| Endpoint | Método | Status |
|---|---|---|
| `/store/:orgId/settings` | GET | ✅ Funcional |
| `/store/:orgId/settings` | PUT | ✅ Funcional |
| `/store/:orgId/products` | GET | ✅ Funcional |
| `/store/:orgId/products` | POST | ✅ Com gating de plano FREE |
| `/store/:orgId/products/:id` | PUT | ✅ Funcional |
| `/store/:orgId/products/:id` | DELETE | ✅ Funcional |
| `/store/:orgId/orders` | GET | ✅ Com items incluídos |
| `/store/:orgId/orders/:id/deliver` | PUT | ✅ Entrega manual |
| `/public/store/:slug/products` | GET | ✅ Corrigido (bug `enabled=false` removido) |
| `/public/store/:slug/checkout` | POST | ✅ Stripe Checkout Session real |
| `/payments/webhook/stripe` | POST | ✅ Recebe eventos Stripe |
| `/internal/store/products/:guildId` | GET | ✅ Usado pelo bot-engine |

---

### Banco de Dados (Prisma Schema)

| Model | Campos Relevantes | Status |
|---|---|---|
| `StoreSettings` | `enabled`, `currency`, `checkoutProvider`, `config` (JSON com Stripe keys + PIX token) | ✅ |
| `StoreProduct` | `name`, `slug`, `description`, `priceCents`, `billingCycle`, `status`, `stock`, `category`, `tags`, `thumbnailUrl`, `deliveryType`, `deliveryConfig`, `isFeatured` | ✅ |
| `StoreProductVariant` | `name`, `priceCents` (override), `stock`, `isActive` | ✅ Schema existe |
| `StoreOrder` | `status` (PENDING/PAID/FAILED/REFUNDED/CANCELLED), `totalCents`, `discountCents`, `couponCode`, `subscriptionId`, `paymentIntentId`, `metadata` | ✅ |
| `StoreOrderItem` | `quantity`, `unitPriceCents`, `deliveryStatus` (PENDING/DELIVERED/FAILED), `deliveryLog` | ✅ |
| `Coupon` | `code`, `discountType` (PERCENT/FIXED), `discountValue`, `maxUses`, `usedCount`, `expiresAt`, `isActive` | ✅ Schema existe |
| `LicenseKey` | `key`, `status` (AVAILABLE/USED/REVOKED), `userId`, `orderId`, `hwid` | ✅ Schema existe |

---

### Frontend Dashboard

| Página | Features | Status |
|---|---|---|
| `/dashboard/store` | Overview com stats reais (receita, pedidos pendentes, produtos ativos) | ✅ |
| `/dashboard/store/products` | CRUD completo — criar, editar, deletar, busca, thumbnail URL, descrição | ✅ |
| `/dashboard/store/orders` | Tabela de pedidos + filtro + entrega manual | ✅ |
| `/dashboard/store/settings` | Stripe keys, PIX token, currency, checkoutProvider | ✅ |

---

### Loja Pública

| Página | Status |
|---|---|
| `/s/[slug]/store` | ✅ Criada — lista produtos ativos com thumbnail, preço, badges |
| `/s/[slug]` (portal) | ✅ Link `← Portal` funcional |

---

### Bot Engine

| Feature | Como funciona | Status |
|---|---|---|
| `/painel` → `store_panel` | Envia embed com botão "Explorar Loja" | ✅ |
| `store_browse` button | Lista produtos via `/internal/store/products/:guildId` | ✅ |
| `store_buy_*` button | Redireciona com embed para URL de checkout | ✅ (URL errada — ver bugs) |

---

## ❌ BUGS & GAPS IDENTIFICADOS

### ✅ Correções já entregues (06/03/2026)

| Item | Status |
|---|---|
| Página `/s/[slug]/store/checkout` | ✅ Implementada |
| Página `/s/[slug]/store/success` | ✅ Implementada |
| Página `/s/[slug]/store/cancel` | ✅ Implementada |
| URL do bot `store_buy_*` corrigida para checkout real | ✅ Implementada |
| Webhook de pagamento para pedidos da loja | ✅ Implementada |
| Arquitetura de domínios customizados + resolução por Host | ✅ Implementada |

### 🔴 Crítico — Bloqueia vendas reais (itens remanescentes)

| # | Bug | Detalhe |
|---|---|---|
| 1 | **PIX sem implementação** | Campo `pixToken` existe nas Settings mas zero código de integração com Mercado Pago/PagSeguro |

### 🟡 Funcionalidades no schema sem API nem UI

| Feature | Schema | API | UI |
|---|---|---|---|
| Variantes de produto | ✅ | ❌ | ❌ |
| Cupons de desconto | ✅ | ❌ | ❌ |
| License Keys | ✅ | ❌ | ❌ |
| Estoque limitado (`stock`) | ✅ | ❌ não validado na compra | ❌ sem campo no form |
| Produto em destaque (`isFeatured`) | ✅ | ❌ não usado | ❌ sem toggle |
| Exportar relatório (CSV) | — | ❌ | ❌ botão existe mas inativo |

### 🟠 UX / Loja Pública

| # | Gap |
|---|---|
| 1 | Botão "Comprar" na loja pública não faz nada |
| 2 | Filtro por categoria não funcional |
| 3 | Sem página de produto individual `/s/[slug]/store/[productSlug]` |
| 4 | Sem carrinho — só compra individual possível |
| 5 | Sem DM de confirmação após compra |

---

## 🗺️ ROADMAP

### FASE 1 — Fechar o ciclo de compra *(urgente)*
> Sem isso nenhuma venda real é possível

| Tarefa | Arquivos afetados |
|---|---|
| 1. Criar `/s/[slug]/store/checkout` | ✅ Concluído |
| 2. Criar `/s/[slug]/store/success` | ✅ Concluído |
| 3. Criar `/s/[slug]/store/cancel` | ✅ Concluído |
| 4. Webhook de pagamento para store orders | ✅ Concluído |
| 5. Corrigir URL do bot (`store_buy_`) | ✅ Concluído |

**Status da Fase 1:** ✅ Finalizada

---

### FASE 1.5 — Multi-tenant + Custom Domains *(novo)*

| Tarefa | Status |
|---|---|
| Modelos `Store` e `StoreDomain` no Prisma | ✅ Concluído |
| Migration SQL de domínios | ✅ Concluído |
| Endpoints admin de domínios (`list/add/verify/set-primary/delete`) | ✅ Concluído |
| Endpoint público `GET /public/store/resolve` | ✅ Concluído |
| Resolver por Host + fallback por subdomínio | ✅ Concluído |
| Redirect canônico para domínio primário | ✅ Concluído |
| UI Admin `/dashboard/store/domains` | ✅ Concluído |

---

### FASE 2 — Funcionalidades de conversão

| # | Tarefa | Prioridade |
|---|---|---|
| 6 | Cupons de desconto — UI de criar/gerenciar + aplicar no checkout | Alta |
| 7 | Estoque limitado — campo no form + validação na criação de pedido | Média |
| 8 | Produto em destaque `isFeatured` — toggle no dashboard + destaque na loja | Média |
| 9 | Página de produto individual `/s/[slug]/store/[productSlug]` | Alta |
| 10 | DM de confirmação via bot após compra aprovada | Alta |

---

### FASE 3 — Monetização avançada

| # | Tarefa |
|---|---|
| 11 | Variantes de produto (tiers/cores/tamanhos com preço diferente) |
| 12 | License Keys — upload em lote, entrega automática no webhook |
| 13 | PIX via Mercado Pago ou PagSeguro |
| 14 | Assinaturas recorrentes — renovação automática + cancelamento self-serve |
| 15 | Analytics de vendas — gráfico de receita, ticket médio, top produtos |

---

### FASE 4 — Experiência premium

| # | Tarefa |
|---|---|
| 16 | Carrinho multi-produto |
| 17 | Botão de reembolso no dashboard (Stripe refund API) |
| 18 | Exportar relatório CSV/PDF (botão já existe na UI) |
| 19 | Sistema de afiliados (link com comissão por venda) |
| 20 | Email de confirmação/recibo após compra |

---

## 📐 Diagrama do Fluxo Atual vs Desejado

### Fluxo Atual (incompleto)
```
Discord: /painel
  └→ store_browse button
       └→ Lista produtos (embed)
            └→ store_buy_X button
                 └→ Embed com link para orbitup.io/store/:guildId/buy/:id  ← 404!
```

### Fluxo Desejado (após Fase 1)
```
Discord: /painel                           Loja Pública
  └→ store_browse button               /s/[slug]/store
       └→ Lista produtos (embed)          └→ Produto card → "Comprar"
            └→ store_buy_X button               │
                 └→ /s/[slug]/store/checkout ←──┘
                      └→ Stripe Checkout Session
                           └→ Pagamento aprovado
                                └→ Webhook: checkout.session.completed
                                     ├→ StoreOrder status = PAID
                ├→ Entrega automática (DeliveryService/drivers)
                ├→ Bot: fluxo de compra com URL correta
                ├→ DM de confirmação (pendente)
                                     └→ /s/[slug]/store/success  ← nova página
```

---

## 🔑 Variáveis de Ambiente Necessárias

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Para checkout redirect
FRONTEND_URL=https://orbitup.io

# PIX (Fase 3)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
```

---

## 📁 Estrutura de Arquivos — Store

```
core-api/src/
  controllers/
    store.controller.ts       ✅ CRUD + público
    payment.controller.ts     ✅ Webhook Stripe (store orders + billing)
  services/domain/
    store.service.ts          ✅ Lógica completa + Stripe checkout
    store-domain.service.ts   ✅ Domínios customizados + resolução por host
  routes/
    store.routes.ts           ✅ Auth + plan gating
    public-store.routes.ts    ✅ /public/store/:slug + /public/store/resolve
    payment.routes.ts         ✅ /payments/webhook/stripe

src/app/
  (dashboard)/dashboard/store/
    page.tsx                  ✅ Overview com stats
    domains/page.tsx          ✅ Gestão de domínios customizados
    products/page.tsx         ✅ CRUD completo
    orders/page.tsx           ✅ Tabela + entrega manual
    settings/page.tsx         ✅ Stripe/PIX config
  s/[slug]/
    store/page.tsx            ✅ Loja pública
    store/checkout/page.tsx   ✅ Implementado
    store/success/page.tsx    ✅ Implementado
    store/cancel/page.tsx     ✅ Implementado

bot-engine/src/
  modules/automation/
    store.ts                  ✅ browse + buy (URL corrigida)
```

---

*Gerado automaticamente — OrbitOS Store Audit · 06/03/2026*
