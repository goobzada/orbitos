# ✅ Store Production Validation Checklist
> OrbitOS / OrbitUp.io
> Date: 06/03/2026
> Scope: Theme, Storefront Visibility, Checkout, Domains, Canonical Redirect
> Purpose: Final production validation before release approval

---

## 1. Infra and Deployment Health

### Checks

- [ ] `pm2 status` shows `orbitos-api`, `orbitos-bot`, `orbitos-web` as `online`
- [ ] `curl -I https://orbitup.io` returns `HTTP 200`
- [ ] `curl -I https://orbitup.io/s/demo` returns `HTTP 200`

### Commands

```bash
pm2 status
curl -I https://orbitup.io
curl -I https://orbitup.io/s/demo
```

---

## 2. Theme Live Sync (Admin -> Public)

### Steps

1. Open `/dashboard/settings/identity`
2. Change template (example: `hologram-pro`) and primary color
3. Save changes
4. Open `/s/{slug}` in an anonymous tab
5. Open `/s/{slug}/store`

### Expected

- [ ] Portal reflects selected template and colors
- [ ] Store reflects the same theme tokens
- [ ] No mismatch between portal and store identity
- [ ] Typography, spacing, and CTA style remain consistent

---

## 3. Admin Preview Parity

### Steps

1. In `/dashboard/settings/identity`, change visual settings without saving
2. Observe preview iframe behavior
3. Change organization context if available

### Expected

- [ ] Preview updates in real time
- [ ] Preview uses selected org context
- [ ] Preview reflects logo, brand, and tenant identity
- [ ] Preview does not break when org changes
- [ ] Preview remains visually close to live result

---

## 4. Product Visibility Pipeline

### Steps

1. Create product in `/dashboard/store/products`
2. Ensure product status is active/published
3. Confirm store is enabled
4. Open `/s/{slug}/store`

### Expected

- [ ] Product appears in public store list
- [ ] Product card shows title, price, category, and CTA
- [ ] Product image/thumbnail loads correctly
- [ ] Empty state appears only when product array is truly empty
- [ ] No mismatch between admin inventory and storefront visibility

---

## 5. Buy CTA and Checkout Routing

### Steps

1. Click `Comprar` on any product card in `/s/{slug}/store`
2. Verify route and product loading

### Expected

- [ ] Navigates to `/s/{slug}/store/checkout?product={productId}`
- [ ] Checkout page loads the correct product
- [ ] Product name, price, and summary are correct
- [ ] User can submit checkout successfully

---

## 6. Stripe Flow (Success / Cancel)

### Steps

1. Start checkout
2. Execute a success scenario in Stripe
3. Execute a cancel scenario in Stripe

### Expected

- [ ] Success redirects to `/s/{slug}/store/success`
- [ ] Cancel redirects to `/s/{slug}/store/cancel`
- [ ] No 404 occurs in payment return routes
- [ ] Success page confirms purchase clearly
- [ ] Cancel page allows retry or return to store

---

## 7. Webhook and Order Delivery

### Steps

1. Complete a real or test purchase
2. Check API logs
3. Check order records in database
4. Validate downstream delivery actions

### Expected

- [ ] `StoreOrder` status becomes `PAID`
- [ ] Delivery flow is processed
- [ ] `StoreOrderItem` status is updated correctly
- [ ] No webhook fatal errors
- [ ] Payment trace is visible in logs

### Optional Checks

- [ ] `paymentIntentId` matches expected order
- [ ] Checkout session reference matches expected order
- [ ] Audit logs include payment and delivery trace
- [ ] Discord role / fulfillment action is executed if applicable
- [ ] Confirmation DM / message is sent if applicable

---

## 8. Domains UI and Operations

### Steps

1. Open `/dashboard/store/domains`
2. Validate all visible sections
3. Add a test domain if allowed

### Expected

- [ ] Default domain is visible and clear
- [ ] DNS instructions (CNAME / TXT) are visible
- [ ] Copy actions work for DNS fields
- [ ] Domain statuses are understandable
- [ ] `verifiedAt` is shown when verified
- [ ] Default domain explanation is clear
- [ ] Empty state is helpful when no custom domains exist

### Expected Status Labels

- [ ] Pending DNS
- [ ] Verified
- [ ] Active
- [ ] Error

---

## 9. Domain Verification and Primary Domain

### Steps

1. Add custom domain
2. Configure DNS (CNAME -> stores gateway)
3. Click `Verificar`
4. Set as primary

### Expected

- [ ] Domain moves from pending to verified/active when DNS is correct
- [ ] Primary badge updates correctly
- [ ] User understands canonical behavior in UI
- [ ] DNS validation feedback is clear
- [ ] No confusing silent failure occurs

---

## 10. Canonical Redirect Behavior

### Steps

1. Set custom domain as primary
2. Access default platform subdomain
3. Access portal and store routes

### Expected

- [ ] Request is redirected to primary domain
- [ ] Portal loads with same tenant context
- [ ] Store loads with same tenant context
- [ ] No redirect loops occur
- [ ] Query params and path remain valid after redirect

---

## 11. Public Experience Consistency

### Steps

1. Open `/s/{slug}`
2. Open `/s/{slug}/store`
3. Compare with admin preview

### Expected

- [ ] Portal and store feel like one product
- [ ] Same visual identity is preserved
- [ ] Theme tokens remain aligned
- [ ] Public experience no longer feels fragmented
- [ ] Store no longer feels disconnected from portal

---

## 12. Final Sign-off Criteria

Approve release only if all below are true:

- [ ] Theme selection is reliably reflected in public portal and store
- [ ] Products created in dashboard consistently appear in storefront
- [ ] Checkout flow completes end-to-end (checkout -> webhook -> success/cancel)
- [ ] Domain management is understandable and operational
- [ ] Primary domain canonical redirect works as expected
- [ ] No blocking regressions in PM2 / web / API health
- [ ] Public experience feels coherent and trustworthy
- [ ] No critical trust-breaking mismatch remains between admin and live experience

---

## 13. Notes / Incident Log

- Environment:
- Branch / commit tested:
- Tester:
- Date / time:
- Failures found:
- Actions taken:
- Retest status:
- Release decision:

---

**End of Document**

Store Production Validation Checklist — OrbitOS / OrbitUp.io
