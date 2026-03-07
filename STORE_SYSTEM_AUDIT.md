# Relatório Técnico – Sistema de Lojas & Roteamento
**Data:** 2026-03-07  
**Organização analisada:** GOOBZADA's HQ (`25adb919-535e-4fd5-afc4-78df09339e6f`)  
**Domínio custom:** `9ineone.com` → `store.slug = goobzada`  

---

## 1. Visão Geral da Arquitetura

O sistema possui **duas UIs de loja paralelas e independentes** que coexistem sem integração:

| Sistema | Arquivo | Rota de acesso | Tema |
|---------|---------|---------------|------|
| **Loja de Template** | `ObsidianEmpireLayout.tsx` | Tab "Loja VIP" no portal | Hardcoded GOLD `#C9A84C` |
| **Loja Standalone** | `src/app/s/[slug]/store/page.tsx` | `9ineone.com/store` → `/s/goobzada/store` | Violet hardcoded + CSS vars |
| **Checkout** | `src/app/s/[slug]/store/checkout/page.tsx` | `9ineone.com/store/checkout` | CSS vars (buildTheme) ✅ |
| **Sucesso** | `src/app/s/[slug]/store/success/page.tsx` | `9ineone.com/store/success` | Violet hardcoded ❌ |
| **Cancelamento** | `src/app/s/[slug]/store/cancel/page.tsx` | `9ineone.com/store/cancel` | Violet hardcoded ❌ |

---

## 2. Mapa de Rotas Completo

### Como o Middleware Funciona (`src/middleware.ts`)

```
Requisição → 9ineone.com/[path]
    ↓
Middleware ve: pathname NÃO começa com /s/
    ↓
Chama: GET /public/store/resolve?host=9ineone.com&path=[path]
    ↓
API retorna: { store: { slug: "goobzada" } }
    ↓
Middleware reescreve: /[path] → /s/goobzada/[path]
    ↓
Next.js serve a rota /s/[slug]/[path]
```

**PROBLEMA CRÍTICO:** A condição é `!pathname.startsWith('/s/')` — qualquer URL que JÁ comece com `/s/` ignora a resolução de domínio. Isso afeta links gerados por templates que incluem o prefixo `/s/`.

### Mapa completo de URLs na 9ineone.com

| URL do browser | Reescrita interna | Componente servido | Tema |
|----------------|-------------------|-------------------|------|
| `9ineone.com/` | `/s/goobzada` | Portal ObsidianEmpire ✅ | Ouro hardcoded |
| `9ineone.com/store` | `/s/goobzada/store` | **Loja Genérica Standalone** ❌ | Violet |
| `9ineone.com/store/checkout?product=X` | `/s/goobzada/store/checkout` | Checkout page | CSS vars (branco #FFF como primary) |
| `9ineone.com/store/success` | `/s/goobzada/store/success` | Página de sucesso | Violet hardcoded |
| `9ineone.com/store/cancel` | `/s/goobzada/store/cancel` | Página de cancelamento | Violet hardcoded |

---

## 3. Bugs Identificados

### 🔴 Bug #1 — Duas lojas incompatíveis: URL `/store` abre UI errada

**Gravidade:** CRÍTICA  
**Arquivo:** `src/app/s/[slug]/store/page.tsx`  
**Sintoma:** Ao navegar para `9ineone.com/store` diretamente (ou ao clicar em links externos), a página exibida é a **Loja Standalone Genérica** com tema violet/roxo, completamente diferente do template ObsidianEmpire.

**Causa Raiz:** A Loja Standalone (`store/page.tsx`) é uma página Next.js independente que não tem relação com o sistema de templates. O portal em `/s/[slug]/page.tsx` renderiza o template completo com a seção de loja embutida. São dois componentes totalmente separados.

**Evidência no código:**
```tsx
// store/page.tsx linha 135 – badge hardcoded violet mesmo com CSS vars no tema
<div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
    <ShoppingBag className="w-5 h-5 text-violet-400" />
```
```tsx
// store/page.tsx linha 250 – botão comprar com violet hardcoded
<Link
    href={`/s/${slug}/store/checkout?product=${product.id}`}  // ← também usa /s/ direto
    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/20"
>
```

---

### 🔴 Bug #2 — `store/page.tsx` usa `/s/${slug}/` nos links de checkout

**Gravidade:** CRÍTICA  
**Arquivo:** `src/app/s/[slug]/store/page.tsx` linha ~250  
**Sintoma:** O botão "Comprar" na loja standalone gera `href="/s/goobzada/store/checkout?product=X"`. Em domínio customizado, o middleware **ignora** esse path (começa com `/s/`), então a URL no browser expõe `/s/goobzada/store/checkout` em vez de `9ineone.com/store/checkout`.

**Causa Raiz:** Não usa o helper `storeHref()` que foi criado para resolver exatamente esse problema.

```tsx
// BUG – usa caminho absoluto com /s/
href={`/s/${slug}/store/checkout?product=${product.id}`}

// CORRETO – deveria usar:
href={storeHref(slug, `/store/checkout?product=${product.id}`)}
```

---

### 🔴 Bug #3 — `cancel/page.tsx` usa `/s/${slug}/` nos links de volta

**Gravidade:** ALTA  
**Arquivo:** `src/app/s/[slug]/store/cancel/page.tsx`  
**Sintoma:** Os links "Voltar à loja" e "Voltar ao portal" usam paths hardcoded com `/s/${slug}/`. Em domínio customizado expõe URL interna.

```tsx
href={`/s/${slug}/store`}   // ← BUG
href={`/s/${slug}`}          // ← BUG
```

---

### 🟠 Bug #4 — `success/page.tsx` sem tema + links hardcoded

**Gravidade:** ALTA  
**Arquivo:** `src/app/s/[slug]/store/success/page.tsx`  
**Sintoma:** Após pagamento bem-sucedido, a página exibe tema violet genérico sem aplicar a identidade da comunidade. Links também usam `/s/${slug}/` diretamente.

```tsx
// Cor violet hardcoded
<div className="w-24 h-24 rounded-full bg-violet-500/10 border border-violet-500/20">
    <CheckCircle2 className="w-12 h-12 text-violet-400" />

// Link hardcoded
href={`/s/${slug}/store`}   // ← não usa storeHref
```
A página **não busca a identidade** da org para aplicar tema, apenas busca o nome.

---

### 🟠 Bug #5 — Checkout: `primaryColor` da DB é `#FFFFFF` (branco) em vez de ouro

**Gravidade:** MÉDIA  
**Origem:** Banco de dados  
**Sintoma:** O checkout agora aplica corretamente `buildTheme(identity, preset)`, mas a identidade salva no DB tem:
```json
"primaryColor": "#FFFFFF"   ← branco, não ouro
"secondaryColor": "#FBBF24" ← amarelo-âmbar (era para ser a cor de acento)
"buttonTextColor": "#000000" ← preto
```
Resultado: Botão "PAGAR COM STRIPE" aparece **branco com texto preto** — não o dourado `#C9A84C` do template ObsidianEmpire.

**Causa Raiz:** O template ObsidianEmpire usa **constantes hardcoded** (`GOLD = '#C9A84C'`) no JSX, ignorando completamente o sistema de CSS vars. Quando o usuário configura as cores no dashboard, essas mudanças afetam o checkout e a loja standalone, mas **não afetam o template em si** (que sempre usa ouro fixo).

---

### 🟡 Bug #6 — `store/page.tsx` aplica CSS vars mas mantém classes violet nos componentes

**Gravidade:** MÉDIA  
**Arquivo:** `src/app/s/[slug]/store/page.tsx`  
**Sintoma:** A página aplica `themeToCSS(theme)` via `<style>` e `<ThemeProvider>`, mas os componentes dentro da página ainda usam classes Tailwind hardcoded (`violet-*`) que não respondem às CSS vars.

```tsx
// CSS vars aplicados globalmente...
:root { --color-primary: #FFFFFF; }

// ...mas os componentes ignoram via classes hardcoded:
className="... bg-violet-600 hover:bg-violet-500 shadow-violet-500/20"
className="... text-violet-400"
```

---

### 🟡 Bug #7 — Loja Standalone: Link "← Portal" usa `/s/${slug}` diretamente

**Gravidade:** BAIXA  
**Arquivo:** `src/app/s/[slug]/store/page.tsx` linha ~145  
```tsx
<Link href={`/s/${slug}`} ...>← Portal</Link>
// Em domínio custom, deveria ser apenas "/"
```

---

### 🟡 Bug #8 — Desconexão entre tema do template e identidade do DB

**Gravidade:** DESIGN/ARQUITETURA  
**Sintoma:** O template ObsidianEmpire **não usa o sistema de tema** (`buildTheme`/CSS vars). Ele define suas próprias constantes de cor:
```tsx
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const GOLD_DIM = '#C9A84C44';
```
Isso significa que mesmo que o administrador mude `primaryColor` no dashboard, o visual do template **não muda**. A mudança só afeta as páginas standalone (loja, checkout, sucesso).

---

## 4. Pipeline Completo de Compra (Estado Atual)

```
Usuario em 9ineone.com
        │
        ├── Clica "Loja VIP" (tab do template)
        │        ↓
        │   ObsidianEmpireLayout.tsx – seção store
        │   Produtos carregados de: community.modules (passados via props)
        │   Botão "COMPRAR" → storeHref(slug, '/store/checkout?product=X')
        │   Na custom domain: href = "/store/checkout?product=X"
        │        ↓
        │   Middleware reescreve: /store/checkout → /s/goobzada/store/checkout ✅
        │        ↓
        │   checkout/page.tsx – busca portal + produtos
        │   Tema: buildTheme(identity) → #FFFFFF como primary ⚠️
        │        ↓
        │   Usuario preenche Discord ID → clica "Pagar com Stripe"
        │        ↓
        │   POST /public/store/goobzada/checkout
        │        ↓
        │   StoreService.createCheckoutSession → Stripe API
        │   Retorna: { checkoutUrl: "https://checkout.stripe.com/..." }
        │        ↓
        │   window.location.href = checkoutUrl → Redireciona para Stripe ✅
        │        ↓
        │   Stripe processa pagamento
        │   success_url: /s/goobzada/store/success?session_id=... 
        │   cancel_url: /s/goobzada/store/cancel
        │        ↓ (sucesso)
        │   success/page.tsx – tema violet, sem identidade aplicada ❌
        │
        └── Navega para 9ineone.com/store diretamente
                 ↓
            Middleware: /store → /s/goobzada/store
                 ↓
            store/page.tsx – Loja GENÉRICA violet ❌ (tema errado)
            Botão "Comprar" → /s/goobzada/store/checkout (URL exposta) ❌
```

---

## 5. Dados da Organização em Produção

```
Org ID:      25adb919-535e-4fd5-afc4-78df09339e6f
Org Slug:    goobzada (corrigido de UUID)
Store ID:    88119cda-8317-4de1-a545-c258014537e2
Store Slug:  goobzada

Domínios:
  - 9ineone.com     (custom, active, ← domínio principal)
  - www.9ineone.com (custom, active)
  - goobzada.orbitup.io (default, active)

Store.primaryDomain: www.9ineone.com

Identidade no DB:
  templateKey:    obsidian-empire
  primaryColor:   #FFFFFF  ← BRANCO (deveria ser ouro para checkout)
  secondaryColor: #FBBF24  ← amarelo-âmbar
  backgroundColor: #000000
  buttonTextColor: #000000 ← preto (consistente com botão branco)
```

---

## 6. Correções Necessárias (Prioridade)

### P1 — Corrigir todos os links hardcoded `/s/${slug}/` nas páginas de loja

**Arquivos:** `store/page.tsx`, `cancel/page.tsx`, `success/page.tsx`

Adicionar o helper `storeHref` (já existe em `checkout/page.tsx` e `ObsidianEmpireLayout.tsx`) e substituir todos os hrefs:

```tsx
// Antes
href={`/s/${slug}/store`}
href={`/s/${slug}/store/checkout?product=${p.id}`}
href={`/s/${slug}`}

// Depois
href={storeHref(slug, '/store')}
href={storeHref(slug, `/store/checkout?product=${p.id}`)}
href={storeHref(slug, '')}  // ou '/'
```

### P2 — Substituir violet hardcoded em `store/page.tsx`, `success/page.tsx`, `cancel/page.tsx`

Todos os `bg-violet-*`, `text-violet-*`, `border-violet-*`, `shadow-violet-*` devem usar `var(--color-primary)` via inline style. Pattern a seguir: o que foi feito no `checkout/page.tsx`.

### P3 — Aplicar tema em `success/page.tsx`

A página deve buscar `portalData.identity`, fazer `buildTheme`, injetar CSS vars. Mesma lógica do checkout:
```tsx
// Adicionar ao useEffect de load():
const identity = portalData.identity || {};
const preset = identity.preset || { config: {} };
setTheme(buildTheme(identity, preset));
```

### P4 — Resolver o conflito "dois sistemas de loja"

**Opção A (Redirecionar):** Fazer `9ineone.com/store` redirecionar para `9ineone.com/` (o portal renderiza a loja via tab). Implementado no middleware ou em `store/page.tsx` detectando custom domain.

**Opção B (Template-aware store):** Fazer `store/page.tsx` detectar `templateKey === 'obsidian-empire'` e renderizar o layout correto em vez do genérico.

**Opção C (Aceitar dois sistemas):** Manter os dois mas garantir que ambos usem o mesmo tema. Mais simples mas confuso para o usuário final.

**Recomendação:** Opção A — redirecionar `/store` para `/` em domínios custom, mantendo a experiência do template unificada.

### P5 — Corrigir `primaryColor` no DB para refletir o ouro do template

Se quiser que o checkout e loja standalone usem ouro, atualizar no DB:
```sql
UPDATE "organization_templates" 
SET "primaryColor" = '#C9A84C', 
    "secondaryColor" = '#E8C96A',
    "buttonTextColor" = '#050505'
WHERE "organizationId" = '25adb919-535e-4fd5-afc4-78df09339e6f';
```
Ou fazer isso pelo dashboard.

### P6 — (Futuro) Integrar ObsidianEmpireLayout com o sistema de CSS vars

Trocar as constantes hardcoded `GOLD`, `GOLD_LIGHT` por `var(--color-primary)`, permitindo que o dono customise as cores pelo dashboard e elas se propaguem **em todas** as páginas de forma coerente.

---

## 7. Resumo de Arquivos Afetados

| Arquivo | Problemas | Prioridade |
|---------|-----------|-----------|
| `src/app/s/[slug]/store/page.tsx` | Violet hardcoded; links `/s/slug/`; loja genérica vs template | P1+P2 |
| `src/app/s/[slug]/store/cancel/page.tsx` | Links hardcoded; sem tema | P1+P2 |
| `src/app/s/[slug]/store/success/page.tsx` | Violet hardcoded; sem tema; links hardcoded | P1+P2+P3 |
| `src/components/templates/layouts/ObsidianEmpireLayout.tsx` | Desconectado do sistema de tema (hardcoded gold) | P6 |
| `core-api/src/services/store/store.service.ts` | success_url/cancel_url usam `/s/${slug}/` — verificar | P1 |
| DB: organization_templates para GOOBZADA | primaryColor = branco em vez de ouro | P5 |

---

## 8. O Que Está Funcionando Corretamente

- ✅ Resolução de domínio custom: `9ineone.com` → `goobzada` via middleware
- ✅ Portal principal: `9ineone.com/` mostra ObsidianEmpire com tema ouro
- ✅ Botão "Comprar" no template: usa `storeHref()` — URL limpa sem UUID
- ✅ Checkout page: aplica `buildTheme(identity)` — theme-aware
- ✅ Fluxo de pagamento: Discord ID → checkout → Stripe → redirect
- ✅ Slugs corrigidos no DB: `org.slug = goobzada`, `store.slug = goobzada`
- ✅ Domínio padrão: `goobzada.orbitup.io` (corrigido de UUID.orbitup.io)
- ✅ API `/public/store/resolve` funcionando
- ✅ Redis e rate limiting operacionais

---

**Gerado em:** 2026-03-07 | **Status:** 8 bugs ativos, 2 críticos, 3 altos
