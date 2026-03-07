# Orbitos Platform — System Roadmap

> Generated: March 2026 | Applies to: `main` branch post bug-fix sprint

---

## System Overview

Orbitos is a multi-tenant Discord automation & e-commerce SaaS. Each **Organization** owns a Discord guild, can deploy a store, and configure automated actions (role grants, game-server commands, webhooks) triggered by customer purchases.

```
User (Discord OAuth) → Organization → Store → Products → Checkout → Stripe → Webhook → Delivery
                                    ↘ Modules (bot commands, tickets, automation)
                                    ↘ Custom Domain → nginx / SSL via DomainProvisionService
```

---

## Architecture

| Layer | Technology | Port | Status |
|-------|-----------|------|--------|
| Web Dashboard | Next.js 15 (App Router) | 3001 | ✅ Stable |
| Core API | Express + Prisma + TypeScript | 4000 | ✅ Stable |
| Discord Bot Engine | discord.js | — | ✅ Stable |
| Orbit Agent Supervisor | Node WebSocket client | — | ✅ Running |
| Redis | In-memory cache + rate limiting | 6379 | ✅ Connected |
| PostgreSQL | Primary database | 5432 | ✅ Healthy |
| nginx | Reverse proxy + SSL termination | 80/443 | ✅ Running |
| Stripe | Payment processing + subscriptions | — | ✅ Configured |

---

## Bugs Fixed (March 2026)

| # | Severity | Description | Fix |
|---|----------|-------------|-----|
| B1 | 🔴 CRITICAL | Duplicate Stripe webhook — `/payments/webhook/stripe` was dead code with wrong `deliveryStatus: 'DELIVERED'` and no idempotency check | Removed dead route; canonical handler is `/webhook/stripe` (WebhookController) |
| B2 | 🔴 CRITICAL | `DeliveryService` DISCORD_ROLE: `serverId` could be `undefined`, silently failing | Added null guard throwing a descriptive error |
| B3 | 🟡 MEDIUM | In-memory rate limit fallback was 2000 req/s (vs 100 in Redis mode) — abuse vector in Redis downtime | Reduced to 200/100/200 (global/org/internal) |
| B4 | 🟢 INFRA | Redis `REDIS_ENABLED=false` was cached in PM2 — API ran without Redis | Rebuilt PM2 process from `core-api/` dir with `REDIS_ENABLED=true` |

---

## Domain Provisioning System (NEW)

### Flow

```
1. Owner calls POST /organizations/:id/store/domains   → creates StoreDomain record (status: pending)
2. Orbitos displays DNS instructions:
   - CNAME: mystore.example.com → stores.orbitup.io
   - TXT: _orbic.mystore.example.com → orbic-verify=<token>
3. Owner adds DNS records and calls POST /domains/:id/verify
4. Core API performs DNS resolution check (resolveCname / resolveTxt)
5. ✅ DNS verified → DomainProvisionService.provision(domain, 3001)
   - creates /etc/nginx/sites-available/<domain> (HTTP proxy block)
   - enables site (symlink to sites-enabled/)
   - runs certbot --nginx -d <domain> --non-interactive --agree-tos
   - nginx auto-reloads with HTTPS redirect
   - StoreDomain.status → 'active'
6. Store resolves custom domain via resolveStoreByHost()
```

### Components

| File | Role |
|------|------|
| `core-api/src/services/domain/store-domain.service.ts` | DNS verify → calls DomainProvisionService |
| `core-api/src/services/domain/domain-provision.service.ts` | Runs nginx + certbot via `exec()` |
| `core-api/scripts/provision-domain.sh` | Shell script (must be on VPS, `chmod +x`) |
| `core-api/src/services/drivers/ssh.driver.ts` | WebSocket relay for remote server commands |

### VPS Requirements

- `orbit` user must have passwordless `sudo` for: `nginx`, `certbot`, `ln`, `rm`, `cat >`
- certbot installed: `sudo apt install certbot python3-certbot-nginx`
- `CERTBOT_EMAIL` environment variable in `/var/www/orbitos/.env` or defaults to `admin@orbitup.io`

---

## Store System

### Purchase Flow

```
Customer → Store page → Add to cart → POST /checkout → Stripe Checkout Session
         ← Redirect to Stripe ←                      ← session_url
         → Pay on Stripe →
                          → Stripe fires checkout.session.completed
                          → POST /webhook/stripe (WebhookController)
                          → Order status: PAID, items: READY
                          → DeliveryService.deliverOrder(orderId)
                          ↘ DISCORD_ROLE → driverManager → ssh.driver → orbit-agent → ADD_ROLE
                          ↘ RCON_COMMAND → driverManager → ssh.driver → orbit-agent → EXECUTE_COMMAND
                          ↘ FIVEM_EVENT  → driverManager → ssh.driver → orbit-agent → EMIT_EVENT
                          ↘ MANUAL       → dashboard notification only
                          → items: DELIVERED or FAILED
```

### Delivery Types

| Type | Driver | Requirement |
|------|--------|-------------|
| `DISCORD_ROLE` | discord | `roleId` in product config + Discord guild connected |
| `RCON_COMMAND` | rcon | `command`, `host`, `port`, `password` in config |
| `FIVEM_EVENT` | fivem | `eventName` + Orbit Agent on same network |
| `SSH_COMMAND` | ssh | `command` + Orbit Agent running on target server |
| `MANUAL` | — | Dashboard operator delivers manually |

---

## Bot Engine

### Module System

Each Organization enables/disables modules in their guild:

| Module | Description | Status |
|--------|-------------|--------|
| `WELCOME` | Auto-welcome DM + role on join | ✅ |
| `TICKET` | Support ticket threads + staff assignment | ✅ |
| `STORE` | Products embedded in Discord (slash commands) | ✅ |
| `MODERATION` | Auto-mod, warn/ban/kick commands | ✅ |
| `LEVELING` | XP + level roles | ✅ |
| `CUSTOM_COMMANDS` | Per-guild custom slash commands | ✅ |
| `AUTOMATION` | Trigger → Action workflows | ✅ |

### Command Registration

- Commands per guild are registered on bot startup via `deploy-commands.ts`
- Global command cleanup via `clear-global-commands.ts`
- Bot receives WebSocket messages from Core API for real-time control

---

## Billing / Plans

| Plan | Store | Modules | API | Automation |
|------|-------|---------|-----|------------|
| FREE | ❌ | Basic | ❌ | ❌ |
| PRO | ✅ | Full | ✅ | Limited |
| ENTERPRISE | ✅ | Full | ✅ | Full |
| MAX | ✅ | Full | ✅ | Full + white-label |

### Stripe Integration

- Checkout sessions use `metadata.type = 'SAAS_UPGRADE'` for plan upgrades
- Subscription events: `customer.subscription.updated`, `customer.subscription.deleted`
- Price ID → Plan mapping via `.env`: `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`, `STRIPE_PRICE_MAX`
- ⚠️ **Known limitation**: changing Stripe Price IDs breaks plan detection — see Pending Work

---

## Pending Work / Roadmap

### 🔴 High Priority

| Task | Description |
|------|-------------|
| **Stripe Price ID resilience** | Map plans via Stripe Product metadata instead of hardcoded Price IDs. Changing prices won't break plan detection. |
| **Multi-tenant store isolation** | `store.service.ts` checkout resolves org by slug without ownership validation. Add strict org ownership assertion. |
| **Domain provisioning sudo** | Verify `orbit` user sudo permissions for nginx/certbot on VPS. Add passwordless sudo entries in `/etc/sudoers.d/orbit-nginx`. |

### 🟡 Medium Priority

| Task | Description |
|------|-------------|
| **Delivery retry queue** | Failed deliveries have no retry logic — add exponential backoff queue (Redis-based) |
| **Webhook signature rotation** | `STRIPE_WEBHOOK_SECRET` is static — add rotation support |
| **Bot reconnection hardening** | Bot uses single WebSocket reconnect — add health check loop |
| **Ticket system escalation** | Tickets have no SLA timer or escalation path to higher roles |
| **Analytics pipeline** | `StoreOrder` history exists but no aggregation service — dashboards show raw counts |

### 🟢 Low Priority / Future

| Task | Description |
|------|-------------|
| **Cloudflare for SaaS** | Replace nginx per-domain provisioning with Cloudflare for SaaS (orange-cloud, automatic SSL without certbot, WAF included) |
| **White-label email** | Transactional emails from custom domain (currently no email system) |
| **Mobile dashboard** | PWA for managing store orders and tickets from phone |
| **API rate limit per plan** | PRO/ENTERPRISE orgs should get higher API quotas (currently flat limits) |
| **Audit log streaming** | Stream audit events to external SIEM via webhook |

---

## VPS Infrastructure

| Site | Domain | Port | SSL |
|------|--------|------|-----|
| orbitup.io | orbitup | 3001/4000 | ✅ LE cert |
| api.orbitup.io | api.orbitup.io | 4000 | ✅ LE cert (SAN) |
| brancodev.com | brancodev | 3002 | ✅ LE cert |
| 9ineone.com | 9ineone | 3001 | ✅ LE cert |

### PM2 Processes

| Name | Port | Restarts |
|------|------|---------|
| orbitos-web | 3001 | 0 |
| orbitos-api | 4000 | 0 |
| orbitos-bot | — | 0 |
| brancodev | 3002 | 0 |
| orbitos-agent-supervisor | — | 0 |

---

## Environment Variables Checklist

```bash
# Core
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://orbitup.io

# Discord
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_BOT_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_PRICE_MAX=price_...

# Redis
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Domains
ROOT_DOMAIN=orbitup.io
STORES_GATEWAY_DOMAIN=stores.orbitup.io
COOKIE_DOMAIN=.orbitup.io
CERTBOT_EMAIL=admin@orbitup.io
```
