# 🚀 DEPLOYMENT GUIDE - Produção VPS

## Passo 1: Pull do novo código

```bash
cd /var/www/orbitup/saasbot
git pull origin fix/security-billing
```

## Passo 2: Atualizar core-api/.env (Produção)

```bash
ssh root@[seu-vps]

# Editar o arquivo
nano /var/www/orbitup/saasbot/core-api/.env
```

**Substituir o conteúdo por:**

```
# Core API - Production Environment
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL="postgresql://orbitos:orbitos_dev@localhost:5432/orbitos_core?schema=public"

# JWT Auth
JWT_SECRET="super-secret-jwt-key-for-saasbot-dev-environment-123"

# 🔒 Internal Service Key (Bot → API authentication)
INTERNAL_SERVICE_KEY="saasbot-internal-secret-v2-change-in-production"

# 🔒 WebSocket Token (Core API ↔ Bot Engine)
BOT_INTERNAL_TOKEN="bot-ws-token-v2-change-in-production"

# 🔑 Discord OAuth2 Credentials - PRODUCTION
DISCORD_CLIENT_ID=1357217419260596425
DISCORD_CLIENT_SECRET=kUhjcuHpg4tK8QuQET_5NCHmkkvlkP5W
DISCORD_REDIRECT_URI=https://orbitup.io/login/callback

# 💳 Stripe (PRODUCTION)
STRIPE_SECRET_KEY=sk_test_COLE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_COLE_AQUI

# 🔧 Redis
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Passo 3: Atualizar bot-engine/.env (Produção)

```bash
nano /var/www/orbitup/saasbot/bot-engine/.env
```

**Substituir o conteúdo por:**

```
# Bot Engine - Production Environment
DISCORD_TOKEN=MTM1NzIxNzQxOTI2MDU5NjQyNQ.G7O2Wd.uL6qYn1-J0mz_WvdkiTEoGuv-fRg7Mz9gSxv84
DISCORD_CLIENT_ID=1357217419260596425
CORE_API_URL=https://orbitup.io
INTERNAL_SERVICE_KEY=saasbot-internal-secret-v2-change-in-production

# 🔒 WebSocket Token (deve ser igual ao BOT_INTERNAL_TOKEN do Core API)
BOT_INTERNAL_TOKEN=bot-ws-token-v2-change-in-production

# Environment
NODE_ENV=production
```

## Passo 4: Instalar dependências e rebuild

```bash
cd /var/www/orbitup/saasbot

# Frontend
npm install
NODE_ENV=production npm run build

# Core API
cd core-api
npm install

# Bot Engine
cd ../bot-engine
npm install
npm run build
```

## Passo 5: Reiniciar serviços PM2

```bash
pm2 restart --update-env
```

## Passo 6: Verificar status

```bash
pm2 status
pm2 logs orbitos-api --lines 50
pm2 logs orbitos-web --lines 50
```

## ✅ Verificação Final

1. Acesse https://orbitup.io
2. Tente fazer login com Discord
3. Deve redirecionar para https://orbitup.io/login/callback ✅

## Rollback (se necessário)

```bash
pm2 stop all
git checkout HEAD -- core-api/.env bot-engine/.env
pm2 start all
```
