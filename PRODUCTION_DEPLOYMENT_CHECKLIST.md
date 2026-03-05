# 🚀 Production Deployment Checklist - PHASE 1 Fixes

**Data**: March 5, 2026  
**Branch**: `fix/system-stabilization` (ou main após merge)

---

## 📋 **Pré-Deployment**

### 1. **Variáveis de Ambiente (core-api/.env)**

```bash
# ⚠️ ALTERAR PARA PRODUÇÃO:

# Discord OAuth
DISCORD_REDIRECT_URI="https://orbitup.io/login/callback"  # ← Mudar de localhost

# Stripe (Modo LIVE)
STRIPE_SECRET_KEY="sk_live_..."  # ← Trocar de sk_test_ para sk_live_
STRIPE_WEBHOOK_SECRET="whsec_..."  # ← Novo secret do webhook produção

# Database
DATABASE_URL="postgresql://user:pass@prod-host:5432/orbitos_prod"  # ← Produção

# JWT Secret (FORTE!)
JWT_SECRET="GERAR_NOVO_SECRET_256_BITS_AQUI"  # ← Nunca usar o de dev

# Internal Keys
INTERNAL_SERVICE_KEY="GERAR_NOVO_SECRET_AQUI"
BOT_INTERNAL_TOKEN="GERAR_NOVO_SECRET_AQUI"

# Frontend URL
FRONTEND_URL="https://orbitup.io"
```

### 2. **Stripe Configuration**

**No Dashboard Stripe (Modo LIVE):**
1. Ir para: https://dashboard.stripe.com/webhooks
2. Criar novo webhook:
   - URL: `https://api.orbitup.io/webhook/stripe`
   - Eventos: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copiar **Signing Secret** → colocar em `STRIPE_WEBHOOK_SECRET`

**Preços (Price IDs):**
```env
STRIPE_PRICE_PRO=price_...       # Copiar do Dashboard Live Mode
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_PRICE_MAX=price_...
```

### 3. **Discord Developer Portal**

1. Ir para: https://discord.com/developers/applications
2. Seu app → OAuth2 → Redirects
3. Adicionar: `https://orbitup.io/login/callback`
4. Salvar mudanças

---

## 🔨 **Build & Deploy**

### **Passo 1: Build Local**

```bash
# No diretório raiz (saasbot/)
cd core-api
npm run build  # ← Deve rodar sem erros

cd ../bot-engine
npm run build  # ← Ignorar warning do command-handler.ts

cd ..
npm run build:web  # ← Build Next.js produção
```

### **Passo 2: Database Migration**

```bash
# No servidor de produção:
cd core-api
npx prisma migrate deploy  # ← Roda migration add_webhook_idempotency
npx prisma generate        # ← Regenera Prisma Client
```

### **Passo 3: Deploy com PM2**

```bash
# No servidor (após pull do código):
pm2 stop all
pm2 delete all

# Build se necessário
npm run build

# Iniciar serviços
pm2 start ecosystem.config.js

# Verificar status
pm2 status
pm2 logs --lines 50
```

---

## ✅ **Validação Pós-Deploy**

### **1. Health Check**
```bash
curl https://api.orbitup.io/health
```

**Resposta esperada (Redis + Database healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-05T...",
  "services": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy", "usingFallback": false }
  }
}
```

**Se Redis down (aceitável, mas não ideal):**
```json
{
  "status": "degraded",
  "services": {
    "redis": { "status": "unhealthy", "usingFallback": true }
  }
}
```

### **2. Testar Autenticação**
1. Acessar: https://orbitup.io/login
2. Login com Discord → callback deve funcionar
3. Verificar cookie `orbitos_token` setado
4. Dashboard carrega sem erro 429

### **3. Testar Webhook Stripe**

**No Stripe Dashboard → Webhooks → Send test webhook:**
1. Enviar `checkout.session.completed`
2. Verificar logs PM2:
   ```bash
   pm2 logs orbitos-api | grep "STRIPE WEBHOOK"
   ```
3. **Deve aparecer:**
   - `✅ Evento recebido: checkout.session.completed`
   - Payment record criado com `stripeEventId`

**Teste de Idempotência:**
1. Reenviar o MESMO evento
2. **Deve aparecer:**
   - `⚠️ Evento duplicado ignorado: evt_...`
   - Status 200, mas sem processar

### **4. Testar Rate Limiting**

**Com Redis funcionando:**
```bash
# 150 requests em 1 segundo (deve bloquear após 100)
for ($i=1; $i -le 150; $i++) { 
  curl https://api.orbitup.io/auth/me -H "Cookie: orbitos_token=..." 
}
```
→ Após request 100: `429 Muitas requisições`

**Simular Redis Down:**
1. Parar Redis: `sudo systemctl stop redis`
2. Verificar logs: `[RATE LIMIT] ⚠️ Redis unavailable - using in-memory fallback`
3. Testar requests → ainda deve bloquear após 100
4. Religar Redis: `sudo systemctl start redis`
5. Logs: `[RATE LIMIT] ✅ Redis reconnected`

### **5. Testar Bot WebSocket**

```bash
pm2 logs orbitos-bot | grep "WS CLIENT"
```

**Esperado:**
- `✅ Conectado e autenticado ao Core API!`
- Se houver erro: `❌ WebSocket error: ...` (agora visível!)

### **6. Testar Checkout Stripe (Ponta a Ponta)**

1. Login no dashboard produção
2. Ir para `/dashboard/billing`
3. Clicar "Fazer Upgrade" (plano PRO)
4. Completar checkout com cartão REAL (ou teste se ainda em test mode)
5. Verificar:
   - Webhook recebido
   - `Payment` criado no DB com `stripeEventId`
   - `Organization.plan` atualizado para "PRO"
   - Cookie/token ainda válido após redirect

---

## 🔍 **Monitoring (Após Deploy)**

### **Logs em Tempo Real**
```bash
# API
pm2 logs orbitos-api --lines 100

# Bot
pm2 logs orbitos-bot --lines 100

# Web
pm2 logs orbitos-web --lines 100

# Todos
pm2 logs --lines 50
```

### **Métricas a Observar**

**Primeira 1 hora:**
- [ ] Erros 500 < 0.1%
- [ ] Rate limit 429 apenas se spam legítimo
- [ ] Health check `/health` sempre 200 ou 503 (nunca timeout)
- [ ] Bot WebSocket sem reconexões excessivas

**Primeira 24 horas:**
- [ ] Webhooks Stripe 100% processados
- [ ] Zero duplicate payments (idempotency funcionando)
- [ ] Redis fallback ativado apenas se Redis crashar
- [ ] Logins Discord funcionando sem 429

---

## 🚨 **Rollback Plan**

Se algo der errado:

```bash
# 1. Voltar código
git revert <commit-hash-do-deploy>
git push origin main

# 2. Rebuild
npm run build

# 3. Rollback migration (se necessário)
cd core-api
npx prisma migrate resolve --rolled-back 20260305_add_webhook_idempotency

# 4. Restart
pm2 restart all

# 5. Verificar health
curl https://api.orbitup.io/health
```

---

## 📊 **Checklist Final**

### **Antes de Deploy:**
- [ ] Todos os testes locais passando
- [ ] Build sem erros TypeScript
- [ ] `.env` produção configurado
- [ ] Stripe webhook configurado (URL + eventos)
- [ ] Discord redirect URI adicionado
- [ ] Database backup criado

### **Durante Deploy:**
- [ ] Migration aplicada (`npx prisma migrate deploy`)
- [ ] PM2 reiniciado (`pm2 restart all`)
- [ ] Logs monitorados (`pm2 logs`)

### **Após Deploy:**
- [ ] Health check retorna 200
- [ ] Login Discord funcionando
- [ ] Rate limiting ativo (Redis ou fallback)
- [ ] Webhook Stripe processando
- [ ] Bot conectado ao WebSocket
- [ ] Zero erros críticos em 1 hora

### **Validação de Fixes PHASE 1:**
- [ ] Node.js version enforçada (bot não inicia em Node incompatível)
- [ ] Webhook idempotency funcionando (duplicatas ignoradas)
- [ ] Redis fallback ativo (rate limit protege mesmo sem Redis)
- [ ] WebSocket errors logados (visíveis nos logs do bot)

---

## 🎯 **Métricas de Sucesso (24h)**

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Uptime API** | > 99.9% | `pm2 show orbitos-api` |
| **Uptime Bot** | > 99.5% | `pm2 show orbitos-bot` |
| **Webhook Success Rate** | 100% | Stripe Dashboard → Webhooks |
| **Duplicate Webhooks Blocked** | 100% | Logs: count "duplicado ignorado" |
| **Auth Errors (429)** | < 0.1% | Logs: count "429" vs total requests |
| **Redis Fallback Activations** | 0 (ideal) | Logs: count "using in-memory fallback" |

---

## 📝 **Notas**

- **Redis Fallback**: Sistema funciona sem Redis (degraded mode), mas ideal ter Redis rodando
- **Database**: Migration é ONE-WAY (não tem down migration automática) → backup antes!
- **Stripe Test Mode**: Se ainda em test mode, webhooks usam `whsec_test_...`
- **PM2 Logs**: Rotacionar logs (`pm2 install pm2-logrotate`) para evitar disco cheio

---

**Deployment Owner**: [Seu Nome]  
**Deployment Date**: [Preencher após deploy]  
**Rollback Tested**: [ ] Yes [ ] No
