# Store Release Gate - Go / No-Go Evaluation

> OrbitOS / OrbitUp.io  
> Date: 2026-03-06  
> Based on: Store Validation Status Report (Tech Lead Handoff)  
> Scope: Final release readiness evaluation for Store module

---

## 1. Current Release State

### Infrastructure Layer

Status: **PASS**

Confirmed:
- PM2 processes online:
  - `orbitos-api`
  - `orbitos-bot`
  - `orbitos-web`
- Public endpoints responding `HTTP 200`
- Local tenant routes also responding correctly

This means:
- Platform availability = OK
- Deployment pipeline = functional
- Tenant routing = operational

Infrastructure **does not block release**.

---

## 2. Functional Validation Status

The production validation checklist has **not yet been completed**.

Current situation:

| Area | Status |
| --- | --- |
| Infra health | PASS |
| Theme live sync | Pending |
| Admin preview parity | Pending |
| Product visibility | Pending |
| Checkout flow | Pending |
| Stripe success/cancel | Pending |
| Webhook delivery | Pending |
| Domain system | Pending |
| Canonical redirect | Pending |

This means the **most critical user-facing flows are still unverified**.

---

## 3. Risk Assessment

### Low Risk

Infrastructure stability.

Evidence:
- services running
- routes responding
- no public availability issue detected

### Medium Risk

Operational noise.

Observed:
- `invalid signature` logs
- bot websocket `401`
- giveaway timer `404`

Impact:
- does not block store
- but may hide real issues in logs

Recommendation:
- reduce log noise
- improve auth validation handling

### High Risk

Functional flows not validated yet.

Critical flows still unchecked:
- Theme -> Portal sync
- Product -> Store visibility
- Checkout -> Stripe
- Stripe -> Webhook
- Webhook -> Delivery
- Domain -> Canonical redirect

If any of these fail, **store cannot operate correctly**.

---

## 4. Release Decision

### Current Status

**CONDITIONAL READY**

Explanation:
- Infrastructure is healthy, but business flows are not validated.

### Release Gate

Production approval requires:
- All checklist items 2-12 completed with evidence

Evidence types:
- screenshots
- logs
- order IDs
- webhook traces

---

## 5. Required Validation Steps

### Step 1 - Theme Sync

Test:
- `/dashboard/settings/identity`

Actions:
- change theme
- save
- open portal

Verify:
- `/s/{slug}`
- `/s/{slug}/store`

Expected:
- Portal reflects theme
- Store reflects theme

### Step 2 - Preview Parity

Test:
- Preview iframe behavior

Verify:
- preview updates
- org context correct
- logo + brand correct

### Step 3 - Product Visibility

Create product:
- `/dashboard/store/products`

Verify:
- `/s/{slug}/store`

Expected:
- product card visible
- title
- price
- image
- CTA

### Step 4 - Checkout Flow

Click:
- `Comprar`

Expected route:
- `/s/{slug}/store/checkout?product={id}`

Verify:
- checkout page loads
- product correct

### Step 5 - Stripe Return Flow

Test:
1. success
2. cancel

Expected:
- `/s/{slug}/store/success`
- `/s/{slug}/store/cancel`

No `404` allowed.

### Step 6 - Webhook Processing

After payment, verify database:
- `StoreOrder.status = PAID`
- `StoreOrderItem` updated

Verify logs:
- webhook processed
- no fatal errors

### Step 7 - Domain System

Open:
- `/dashboard/store/domains`

Validate:
- default domain
- add custom domain
- DNS instructions
- verification
- set primary

### Step 8 - Canonical Redirect

Set custom domain as primary.

Test:
- old domain -> redirect -> new domain

Verify:
- no redirect loop
- tenant context preserved

---

## 6. Release Evidence Required

Before marking release **GO**, collect:

### Screenshots

- theme applied
- product visible in store
- checkout page
- success page
- domains UI

### Logs

- webhook log
- order log
- payment trace

### Identifiers

- `orderId`
- `stripe session id`
- `paymentIntentId`

---

## 7. Recommended Timeline

If tests run smoothly:
- Validation execution time: 45-90 minutes

Suggested order:
1. Theme sync
2. Product visibility
3. Checkout
4. Stripe success/cancel
5. Webhook
6. Domain verification
7. Canonical redirect

---

## 8. Observability Improvements (Post-Release)

Recommended follow-ups:

### Logging

Reduce noise from:
- `invalid signature`
- bot websocket auth
- giveaway timer

### Deploy Hygiene

Avoid git conflicts on VPS.

Ensure `.gitignore` includes:
- `dist/`
- `node_modules/`
- `.next/`

### Deploy Script

Standardize deploy:

```bash
git pull origin fix/security-billing
npm install
npm run build
pm2 restart orbitos-api --update-env
pm2 restart orbitos-web --update-env
pm2 restart orbitos-bot --update-env
pm2 save
```

---

## 9. Final Approval Criteria

Release can be approved when all are true:
- Theme applies live
- Products visible in store
- Checkout works
- Stripe success/cancel works
- Webhook updates orders
- Domains flow works
- Canonical redirect works
- No major regressions

## 10. Final Recommendation

Do not mark release fully approved yet.

Recommended state:
- **CONDITIONAL READY**

Move to:
- **PRODUCTION APPROVED**

Only after checklist items 2-12 are executed and verified.

---

End of Document

Store Release Gate - OrbitOS / OrbitUp.io
