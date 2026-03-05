# 🔥 Stripe Billing & Subscription Setup

Este guia completo configura o sistema de assinaturas da plataforma com Stripe.

---

## 📋 Pré-requisitos

- Conta Stripe (https://stripe.com)
- Acesso ao Dashboard Stripe
- Variáveis de ambiente configuradas

---

## 1️⃣ Criar Produtos no Stripe Dashboard

Acesse: https://dashboard.stripe.com/products

### Produto 1: OrbitOS Pro (Mensal)
- **Nome:** OrbitOS Pro
- **Descrição:** Plano profissional com servidores e tickets ilimitados
- **Preço:** R$ 29,00 / mês (BRL)
- **Tipo:** Recorrente (Monthly)
- **Metadata:**
  - `plan`: `PRO`

### Produto 2: OrbitOS Enterprise (Mensal)
- **Nome:** OrbitOS Enterprise
- **Descrição:** Plano corporativo com SLA garantido e suporte 24/7
- **Preço:** R$ 99,00 / mês (BRL)
- **Tipo:** Recorrente (Monthly)
- **Metadata:**
  - `plan`: `ENTERPRISE`

### Produto 3: OrbitOS Max (Anual)
- **Nome:** OrbitOS Max
- **Descrição:** Plano anual com tudo ilimitado e suporte VIP
- **Preço:** R$ 299,00 / ano (BRL)
- **Tipo:** Recorrente (Yearly)
- **Metadata:**
  - `plan`: `MAX`

---

## 2️⃣ Configurar Variáveis de Ambiente

### Backend (core-api/.env)

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...  # Produção: sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (copie do Dashboard Stripe após criar os produtos)
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_PRICE_MAX=price_...

# Frontend URL (para redirect após checkout)
FRONTEND_URL=https://orbitup.io
```

### Frontend (/.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.orbitup.io
```

---

## 3️⃣ Configurar Webhooks no Stripe

### Endpoint de Webhook
Acesse: https://dashboard.stripe.com/webhooks

**URL do Webhook:** `https://api.orbitup.io/webhooks/stripe`

### Eventos a Escutar:
- ✅ `checkout.session.completed` — Checkout aprovado (upgrade)
- ✅ `invoice.paid` — Pagamento recorrente bem-sucedido
- ✅ `customer.subscription.updated` — Mudanças no plano
- ✅ `customer.subscription.deleted` — Cancelamento

### Importante:
1. Copie o **Signing Secret** (whsec_...)
2. Cole em `STRIPE_WEBHOOK_SECRET` no `.env`

---

## 4️⃣ Ativar Stripe Billing Portal

Acesse: https://dashboard.stripe.com/settings/billing/portal

### Configurações Recomendadas:
- ✅ **Permitir cancelamento de subscription:** Sim (ao final do período)
- ✅ **Permitir atualização de método de pagamento:** Sim
- ✅ **Permitir visualizar faturas:** Sim
- ✅ **Permitir upgrade/downgrade:** Opcional (ou use nosso checkout)

---

## 5️⃣ Testar o Fluxo (Modo Teste)

### Cartões de Teste Stripe:
- ✅ **Aprovado:** `4242 4242 4242 4242`
- ❌ **Recusado:** `4000 0000 0000 0002`
- **CVV:** Qualquer 3 dígitos
- **Data:** Qualquer data futura

### Fluxo de Teste:
1. Acesse `/dashboard/billing`
2. Clique em **Fazer Upgrade** no plano Pro
3. Complete checkout com cartão de teste
4. Verifique webhook no Stripe Dashboard
5. Confirme que o plano foi atualizado na org

---

## 6️⃣ Mapear Price IDs Automaticamente (Código)

Se preferir criar produtos via código (recomendado para staging/dev):

```typescript
// core-api/src/scripts/setup-stripe-products.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any
});

async function setupProducts() {
  // Pro Plan
  const proProd = await stripe.products.create({
    name: 'OrbitOS Pro',
    description: 'Plano profissional com recursos ilimitados',
    metadata: { plan: 'PRO' }
  });

  const proPrice = await stripe.prices.create({
    product: proProd.id,
    unit_amount: 2900, // R$ 29,00
    currency: 'brl',
    recurring: { interval: 'month' }
  });

  console.log('PRO Price ID:', proPrice.id);

  // Enterprise Plan
  const entProd = await stripe.products.create({
    name: 'OrbitOS Enterprise',
    description: 'Plano corporativo com SLA e suporte dedicado',
    metadata: { plan: 'ENTERPRISE' }
  });

  const entPrice = await stripe.prices.create({
    product: entProd.id,
    unit_amount: 9900, // R$ 99,00
    currency: 'brl',
    recurring: { interval: 'month' }
  });

  console.log('ENTERPRISE Price ID:', entPrice.id);

  // Max Plan
  const maxProd = await stripe.products.create({
    name: 'OrbitOS Max',
    description: 'Plano anual com tudo ilimitado',
    metadata: { plan: 'MAX' }
  });

  const maxPrice = await stripe.prices.create({
    product: maxProd.id,
    unit_amount: 29900, // R$ 299,00
    currency: 'brl',
    recurring: { interval: 'year' }
  });

  console.log('MAX Price ID:', maxPrice.id);
}

setupProducts().then(() => process.exit(0));
```

Execute:
```bash
cd core-api
npx tsx src/scripts/setup-stripe-products.ts
```

---

## 7️⃣ Usar Price IDs no Checkout

Atualize `createCheckoutSession` para usar Price IDs reais:

```typescript
// core-api/src/controllers/billing.controller.ts

const planPriceIds: Record<string, string> = {
  PRO: process.env.STRIPE_PRICE_PRO!,
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE!,
  MAX: process.env.STRIPE_PRICE_MAX!,
};

const priceId = planPriceIds[planId.toUpperCase()];
if (!priceId) return res.status(400).json({ error: 'Plano inválido.' });

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }], // Use Price ID direto
  mode: 'subscription',
  success_url: `${process.env.FRONTEND_URL}/dashboard/billing?success=true`,
  cancel_url: `${process.env.FRONTEND_URL}/dashboard/billing?canceled=true`,
  customer_email: user?.email,
  metadata: {
    type: 'SAAS_UPGRADE',
    organizationId: org.id,
    targetPlan: planId.toUpperCase(),
    userId: String(userId)
  }
});
```

---

## 8️⃣ Checklist Final

- ✅ Produtos criados no Stripe Dashboard
- ✅ Price IDs copiados para `.env`
- ✅ Webhook configurado e testado
- ✅ Billing Portal ativado
- ✅ Fluxo de checkout testado com cartão de teste
- ✅ Cancelamento e reativação funcionando
- ✅ Webhooks processando eventos corretamente

---

## 🐛 Troubleshooting

### Webhook não está sendo chamado
1. Verifique URL: `https://api.orbitup.io/webhooks/stripe`
2. Teste webhook manualmente no Dashboard Stripe → "Send test webhook"
3. Verifique logs: `pm2 logs core-api | grep STRIPE`

### Checkout retorna erro
1. Verifique se STRIPE_SECRET_KEY está correto
2. Confirme que Price IDs existem no Stripe
3. Verifique CORS no backend (allow FRONTEND_URL)

### Plano não atualiza após pagamento
1. Verifique se webhook `checkout.session.completed` foi recebido
2. Confirme metadata: `organizationId`, `targetPlan`
3. Verifique logs do webhook handler

---

## 🚀 Próximos Passos

- [ ] Migrar de Test Mode para Live Mode no Stripe
- [ ] Configurar e-mails transacionais (recibo, cancelamento)
- [ ] Adicionar analytics de conversão
- [ ] Implementar cupons de desconto
- [ ] Adicionar trial periods (períodos de teste)

---

**Documentação completa:** https://stripe.com/docs/billing/subscriptions/overview
