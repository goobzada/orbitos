# 🛒 Store Critical Fixes Audit
> OrbitOS / OrbitUp.io
> Date: 06/03/2026
> Focus: Templates, Storefront Sync, Product Visibility, Domain UX
> Status: Critical Review Based on Current Screens + Existing Implementation

---

# 1. Executive Summary

The current Store module has a **serious product consistency problem**.

The backend has many implemented parts, but the **real user-facing flow is broken or confusing**.

Main issues identified:

1. **Template selection does not apply to the public portal/store**
2. **Products exist in dashboard but do not render correctly in storefront**
3. **Storefront and portal look disconnected from admin configuration**
4. **Domain management UI is too weak and incomplete**
5. **The overall store UX feels unfinished and inconsistent**

This means the system currently looks like:

- admin says product exists
- storefront says no products active
- theme preview looks one way
- live portal/store looks another way
- domain system exists technically, but feels incomplete in the UI

---

# 2. Main Problems Identified

---

## 🔴 Problem 1 — Template selection is not being applied

### Evidence
In the template screen, the user selects a theme like:

- Obsidian Empire
- Neon Grid
- Minimal Glass
- etc.

But the public-facing page does **not reflect the selected template**.

### What this means
The current implementation likely has one of these problems:

1. selected template is stored in admin only but not consumed by live portal/store
2. preview uses static/demo data instead of real tenant store config
3. live public page ignores selected `themeId`
4. theme selection updates one module but not the storefront renderer

### Root issue
There is no reliable **theme binding layer** between:

```text
Dashboard Settings
→ Saved Theme
→ Public Portal Renderer
→ Store Renderer
```

### Expected behavior

When tenant selects a theme:

```text
Admin selects theme
→ save in DB
→ public portal uses that exact theme
→ store inherits same theme rules or its mapped variation
```

### Required fix

Create a single source of truth:

- `communityThemeId`
- `storeThemeId` or inherited from portal theme
- live renderer must always resolve from database

---

## 🔴 Problem 2 — Products are created in dashboard but do not appear in storefront

### Evidence

In `dashboard/store/products` there is at least one visible product:

- "Vip Diamante"
- price visible
- image visible
- card visible

But in public store:

```text
Nenhum produto ativo.
```

### What this means

The store frontend and admin inventory are not synchronized correctly.

### Most likely causes

One or more of these is happening:

- product status mismatch
  - dashboard shows all products
  - storefront filters only ACTIVE
  - created product may not actually be published
- slug/org mismatch
  - admin saves under one org/store
  - public route loads another slug/store context
- storefront query is filtering wrong
  - maybe using `enabled = true` only
  - maybe also filtering stock/visibility/store enabled incorrectly
- API response mismatch
  - frontend expects one shape
  - backend sends another shape
  - product list silently fails
- store settings disabled
  - `StoreSettings.enabled = false`
  - product exists but store is considered inactive
- theme/store route is pointing to wrong tenant context

### Critical conclusion

This is not just a UI bug.
This is a trust-breaking bug.

The seller sees:

```text
I created a product
```

But the buyer sees:

```text
No active products
```

That kills confidence in the whole system.

---

## 🔴 Problem 3 — Storefront and portal are fragmented

### Evidence from screens

There are at least 3 experiences:

- public community portal `/s/[slug]`
- public store `/s/[slug]/store`
- theme preview inside admin

And these three do not feel connected as one coherent system.

### Symptoms

- portal has one identity
- store has another identity
- preview shows another identity
- admin uses another visual logic

### What is wrong

Today the system feels like:

```text
Portal module
+ Store module
+ Theme preview module
+ Admin module
```

instead of:

```text
One tenant experience
→ one visual system
→ one public identity
→ one store module
```

### Required correction

The architecture needs a single tenant presentation layer.

### Correct model

Each tenant should have:

- one visual identity
- one public portal
- one store attached to the same identity
- one theme system affecting both portal and store

---

## 🔴 Problem 4 — Domain screen is too weak

### Evidence

The domain page currently shows:

- “Domínio padrão”
- input to add custom domain
- empty list area
- almost no operational guidance

### Why this is weak

For a custom-domain SaaS, the current page does not feel production-ready because it lacks:

- default domain display clarity
- DNS instructions clearly rendered
- verification status hierarchy
- primary/canonical domain logic visibility
- SSL/provisioning state
- examples
- troubleshooting
- domain actions UX

### Missing essential elements

The domain system should show:

### Default domain block

- `slug.orbitup.io`
- status: active
- note: always available

### Custom domains list

- domain
- type
- status
- verified at
- primary badge
- actions:
  - verify
  - set primary
  - remove

### DNS instructions panel

When adding `www.clientdomain.com`, show:

```text
Type: CNAME
Name: www
Target: stores.orbitup.io
```

And optionally TXT verification.

### Health/status states

- Pending DNS
- Verified
- SSL Provisioning
- Active
- Error

### Current conclusion

Technically it may exist in backend, but product-wise this page is still MVP/incomplete.

---

# 3. UX Problems

## 3.1 Store page feels empty and unfinished

The current store page with:

- Em breve
- Nenhum produto disponível no momento
- Nenhum produto ativo

creates a bad impression.

Even if there are no products, it should feel premium.

### What should happen

If no products exist:

- better empty state
- explain store is being prepared
- branded illustration
- CTA back to portal
- optional featured/community perks block

Right now it feels like broken system, not intentional empty state.

## 3.2 Admin product card and public store do not mirror each other

Admin shows a polished product card.
Public store does not show same product.

This creates a psychological mismatch:

```text
dashboard = looks ready
frontend = looks broken
```

## 3.3 Theme system lacks trust

If user selects a theme and nothing changes publicly, the user stops trusting:

- theme settings
- visual customization
- preview system
- possibly the whole platform

This must be fixed with high priority.

---

# 4. Root Causes (Architectural Reading)

Based on what is visible, the likely architectural problems are:

## 4.1 Theme persistence and theme rendering are disconnected

Probable issue:

- theme selection saved somewhere
- preview reads mock/local state
- live portal/store reads default hardcoded template

## 4.2 Public store query and admin product query are not aligned

Probable issue:

- admin reads `StoreProduct[]`
- public store reads only filtered/published subset
- create/edit UI does not expose all required publication flags

## 4.3 Tenant identity resolution may still be inconsistent

Possible issue:

- portal resolves by slug
- store resolves by store settings
- domain resolves by another layer
- product query resolves by orgId
- theme query resolves by different config object

Everything needs to resolve from the same tenant context.

---

# 5. What Must Be Fixed Immediately

## Priority 1 — Make selected theme apply for real

### Required actions

- ensure theme selection writes to DB
- ensure public portal loads selected theme from DB
- ensure store page also uses selected theme or theme mapping
- remove hardcoded fallback UI except true fallback case
- preview must use real tenant data, not fake demo state

### Acceptance criteria

- select theme in admin
- refresh public portal
- live portal reflects chosen theme
- store reflects same visual system

## Priority 2 — Fix product visibility pipeline

### Required actions

Audit the full flow:

```text
Admin create product
→ DB save
→ product status
→ store enabled
→ public API query
→ frontend render
```

### Backend checks

Verify:

- product saved under correct org/store
- status is active/published
- public endpoint returns product
- no hidden filter removes it incorrectly
- store settings do not disable storefront

### Frontend checks

Verify:

- storefront fetch succeeds
- response shape matches expected props
- render does not silently fail
- empty state only shows when array is truly empty

### Acceptance criteria

- product created in dashboard appears in `/s/[slug]/store`
- product card contains image, title, price, CTA

## Priority 3 — Redesign Domain page to production standard

### Required actions

Add these sections:

### A. Default Domain

- show current default domain
- show status
- show explanation

### B. Add Custom Domain

- input
- validation
- add button

### C. DNS Instructions

- show exact CNAME
- show TXT if needed
- copy buttons

### D. Domains Table

Columns:

- domain
- type
- status
- primary
- verified at
- actions

### E. Status Legend

Explain:

- pending
- verified
- ssl provisioning
- active
- error

### Acceptance criteria

User can:

- understand what default domain is
- add domain
- know what DNS to configure
- verify domain
- set primary
- understand health/status

## Priority 4 — Unify public experience

### Required actions

Treat these as one ecosystem:

- `/s/[slug]`
- `/s/[slug]/store`
- theme preview
- domain/canonical

### Rules

- same branding
- same typography family
- same color logic
- same layout language
- same theme source of truth

### Acceptance criteria

Portal and store feel like one product.

---

# 6. Recommended Product Architecture

### Correct mental model

```text
Tenant
 ├── Public Portal
 ├── Store
 ├── Theme
 ├── Domain
 └── Products
```

### Theme

Controls:

- public portal
- store visual skin
- blocks/sections style
- buttons/cards/spacing/typography

### Products

Belong to store and must always render in same tenant context.

### Domain

Belongs to tenant/store and should point to:

- portal
- store routes under same identity

---

# 7. Exact Fix Plan for Dev

### Phase A — Debug and restore trust

- fix theme application
- fix storefront product rendering
- verify store enabled state
- validate public API response
- align slug/org/store resolution

### Phase B — Strengthen domain system

- improve default domain display
- improve add domain UX
- render DNS instructions
- add statuses and actions
- expose primary/canonical clearly

### Phase C — Unify visual system

- public portal and store must share theme tokens
- preview must match live
- store empty state must feel intentional
- remove visual fragmentation

---

# 8. Technical Audit Checklist

### Theme audit

- [ ] selected theme persists in DB
- [ ] preview uses DB-backed theme
- [ ] public portal uses DB-backed theme
- [ ] store uses same theme system
- [ ] no hardcoded fallback overriding selected theme

### Product visibility audit

- [ ] product saved with correct orgId/storeId
- [ ] product status is active/published
- [ ] store enabled = true
- [ ] public endpoint returns products
- [ ] frontend maps response correctly
- [ ] empty state only when truly empty

### Domain system audit

- [ ] default domain shown correctly
- [ ] custom domain add works
- [ ] DNS instructions visible
- [ ] verify action works
- [ ] set primary works
- [ ] status badges clear
- [ ] canonical behavior explained

### UX consistency audit

- [ ] portal and store share same theme
- [ ] admin preview matches live
- [ ] typography consistent
- [ ] spacing/layout consistent
- [ ] storefront no longer feels broken

---

# 9. Final Conclusion

The Store system is not broken at backend-only level.
The real issue is that the product experience is fragmented and unreliable.

Today the user perceives:

- template selection does not work
- products do not appear publicly
- domain system feels weak
- store feels disconnected from portal

This means the next priority is not adding more features.

The next priority is:

- stabilize theme application
- stabilize product publishing/rendering
- strengthen domain UX
- unify the tenant public experience

Only after that should new features continue.

---

# 10. Recommended Immediate Focus

Work on these 3 items first:

1. Template selected must apply live
2. Products created must appear in storefront
3. Domain page must be redesigned to feel production-ready

If these three are fixed, the whole Store module will immediately feel far more professional and trustworthy.

---

**End of Document**

Store Critical Fixes Audit — OrbitOS / OrbitUp.io
