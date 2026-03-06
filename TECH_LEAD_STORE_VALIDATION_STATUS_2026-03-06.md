# Store Validation Status Report (Tech Lead Handoff)

Date: 2026-03-06
Project: OrbitOS / OrbitUp.io
Branch: `fix/security-billing`
Prepared by: Engineering assistant

## 1. Executive Summary

O ciclo de estabilizacao da Store avancou e a validacao de infraestrutura (Checklist Item 1) foi concluida com sucesso.

What is confirmed:
- PM2 processos principais estao online (`orbitos-api`, `orbitos-bot`, `orbitos-web`).
- Endpoints publicos responderam `HTTP 200` (`https://orbitup.io` e `https://orbitup.io/s/demo`).
- Rotas locais de tenant tambem responderam `200` no ambiente local (`localhost:3001`).

What is still pending:
- Itens funcionais de negocio do checklist (Theme Sync, Preview Parity, Product Visibility, Checkout/Stripe/Webhook, Domains flow, Canonical Redirect) ainda precisam de execucao e marcacao final.

## 2. Release-Relevant Commits

Recentes no branch `fix/security-billing`:
- `179fcf4` - `docs(checklist): mark infra health validation as passed`
- `872ac7c` - `docs(store): add production validation checklist`
- `c1e80c4` - `feat(store): finalize critical reliability and domain clarity`
- `2650eaf` - `feat(store): make admin preview tenant-aware and db-backed`
- `967ebbe` - `feat(store): continue critical-fixes implementation`

## 3. Infrastructure Validation Evidence (Checklist Item 1)

Validated as PASS:
- `pm2 status`:
  - `orbitos-api` -> online
  - `orbitos-bot` -> online
  - `orbitos-web` -> online
- `curl -I https://orbitup.io` -> `200`
- `curl -I https://orbitup.io/s/demo` -> `200`

Local sanity checks:
- `http://localhost:3001/s/e9130c1f-7700-41ae-96ca-31846f47338e/store` -> `200`
- `http://localhost:3001/s/e9130c1f-7700-41ae-96ca-31846f47338e` -> `200`

## 4. Operational Findings From Logs

Non-blocking but important signals observed:
- API auth noise: repeticao de `invalid signature` em rotas autenticadas (`/me`, `/overview`, `/audit/recent`).
- Bot WS instability: erros `401` intermitentes no cliente WebSocket.
- Bot module noise: `Giveaway Timer` com `404` e timeouts ocasionais.
- Web log traces historicos de mismatch de deploy Next.js (`required-server-files.json`, `Failed to find Server Action`) vistos em error log, sem evidencia atual de indisponibilidade publica.

Assessment:
- Estado atual suporta continuidade de validacao funcional.
- Existe debito operacional/observability para reduzir ruido de logs e evitar regressao silenciosa.

## 5. VPS Deployment Hygiene Notes

During VPS operations, recurrent blockers were caused by generated artifacts tracked/modificados localmente:
- `dist/` outputs
- `node_modules` artifacts
- temporary files (`FETCH_HEAD`, generated command leftovers)

Mitigations applied during operations:
- `git restore .` and `git clean -fd` (when needed)
- restart using correct PM2 process names (`orbitos-api`, `orbitos-bot`, `orbitos-web`)

Recommendation:
- Keep VPS workspace clean and avoid creating local commits for generated files.
- Standardize deploy script to avoid manual drift.

## 6. Checklist Status Snapshot

Current status:
- Item 1 (Infra and Deployment Health): PASS
- Item 2+: PENDING EXECUTION

Reference file:
- `STORE_PROD_VALIDATION_CHECKLIST.md`

## 7. Next Actions (Priority Order)

1. Execute Item 2 (Theme Live Sync) end-to-end and mark results.
2. Execute Item 3 (Admin Preview Parity) with org-context switch test.
3. Execute Item 4-7 (Store visibility + checkout + webhook) using one real test scenario with trace IDs.
4. Execute Item 8-10 (Domains + canonical redirect) with one custom domain test.
5. Close Item 11/12 sign-off with evidence links (screenshots + logs + order IDs).

## 8. Risks Before Final Approval

Release should not be marked fully approved yet because:
- Functional validation blocks (Item 2 onward) are still pending.
- Bot/API warning patterns may hide real incidents if not triaged.

Suggested gate:
- Keep release at "Conditional Ready" until checklist Items 2-12 are completed with evidence.

## 9. Appendix: Commands Used (Key)

```bash
pm2 status
curl -I https://orbitup.io
curl -I https://orbitup.io/s/demo

# local checks
# (via HTTP HEAD)
http://localhost:3001/s/e9130c1f-7700-41ae-96ca-31846f47338e
http://localhost:3001/s/e9130c1f-7700-41ae-96ca-31846f47338e/store
```

---

If needed, this report can be converted into a release go/no-go template with owners and timestamps per checklist section.
