# AUTH FLICKER & LOGOUT FIX - Implementation Summary

**Date**: March 5, 2026  
**Branch**: fix/auth-flicker-logout

---

## 🐛 **Problems Fixed**

### 1. **Auth Flicker (Pisca-pisca)**
**Root Cause**: Middleware was decoding JWT client-side and checking `exp`, causing:
- Flicker when cookie exists but JWT is expired
- Dependency on JWT_SECRET in frontend (not available)
- Unnecessary redirect loops

**Solution**: Middleware now ONLY checks cookie presence. Backend validates token on API calls.

### 2. **Logout Not Working**
**Root Cause**: Cookie attributes mismatch between login and logout:
- Login: `sameSite: production ? 'none' : 'lax'`, `domain: '.orbitup.io'` (prod only)
- Logout: Multiple variants with different attributes

**Solution**: Consistent cookie config helper used for both login and logout.

---

## 📝 **Files Changed**

### **1. src/middleware.ts** (Simplified)
```typescript
/* BEFORE */
- Decoded JWT payload client-side
- Checked exp and role
- Cleared expired cookies
- SUPER_ADMIN role check for /platform

/* AFTER - FIX A */
- Only checks cookie presence (no JWT decode)
- Backend enforces role via requireRole middleware
- Loop-safe redirects (no 'from' param on callbacks)
- Simplified: token exists → allow, no token on protected → redirect to /login
```

**Key Changes**:
- ❌ Removed `parseJwtPayload()` function
- ❌ Removed `clearAuthCookie()` function
- ❌ Removed `exp` and role checks
- ✅ Simplified to cookie presence check only

---

### **2. core-api/src/controllers/auth.controller.ts** (Cookie Config Helper)
```typescript
/* BEFORE */
- Cookie config duplicated in login and logout
- Logout had 2 variants (host-only + production)
- Hardcoded domain: '.orbitup.io'

/* AFTER - FIX B */
- getCookieConfig() helper for consistent attributes
- Single cookie clear with exact same attributes
- Env-driven COOKIE_DOMAIN (optional)
```

**Key Changes**:
- ✅ Added `getCookieConfig()` helper
- ✅ Login uses `...getCookieConfig()` + `maxAge: 7d`
- ✅ Logout uses `...getCookieConfig()` + `maxAge: 0`
- ✅ COOKIE_DOMAIN env var (optional, default: no domain)

---

### **3. src/app/api/auth/logout/route.ts** (Frontend Logout)
```typescript
/* BEFORE */
- Cleared cookies with 2 variants (lax + none)
- Hardcoded domain: '.orbitup.io'

/* AFTER - FIX B */
- Single cookie clear with exact attributes
- Uses NEXT_PUBLIC_COOKIE_DOMAIN env var
```

**Key Changes**:
- ❌ Removed dual cookie clear (lax + none variants)
- ✅ Single clear with consistent attributes
- ✅ Respects `NEXT_PUBLIC_COOKIE_DOMAIN` env

---

## 🔧 **Environment Variables (Optional)**

### **Backend (.env)**
```env
# Optional: Set cookie domain for cross-subdomain auth
# Production: COOKIE_DOMAIN=.orbitup.io
# Dev: Leave empty (host-only cookie)
COOKIE_DOMAIN=

# Required (existing)
NODE_ENV=development  # or production
JWT_SECRET=...
```

### **Frontend (.env.local)**
```env
# Optional: Must match backend COOKIE_DOMAIN
# Production: NEXT_PUBLIC_COOKIE_DOMAIN=.orbitup.io
# Dev: Leave empty
NEXT_PUBLIC_COOKIE_DOMAIN=
```

**Notes**:
- If `COOKIE_DOMAIN` is empty → host-only cookie (default for localhost)
- If set to `.orbitup.io` → works across subdomains (api.orbitup.io ↔ orbitup.io)

---

## ✅ **Test Plan**

### **1. Login Flow**
```bash
# Steps:
1. Navigate to http://localhost:3001
2. Click "Login com Discord"
3. Complete OAuth flow
4. Verify redirected to /dashboard
5. Check DevTools → Application → Cookies:
   - Cookie 'token' exists
   - httpOnly: true
   - sameSite: Lax (dev) / None (prod)
   - secure: false (dev) / true (prod)
   - domain: <empty> (dev) / .orbitup.io (prod)
```

**Expected**: ✅ Cookie set, redirected to /dashboard

---

### **2. Refresh (No Flicker)**
```bash
# Steps:
1. After login, press F5 or Ctrl+R
2. Observe page behavior

# Watch for:
- NO redirect to /login
- NO flash of login page
- Dashboard loads immediately
```

**Expected**: ✅ No flicker, stays on /dashboard

---

### **3. Navigate Protected Routes**
```bash
# Steps:
1. Navigate to /dashboard/billing
2. Navigate to /dashboard/settings
3. Navigate to /dashboard (back)

# Watch for:
- NO login redirects
- Smooth navigation
- Content loads without auth checks visible
```

**Expected**: ✅ Seamless navigation, no auth checks

---

### **4. Logout (Cookie Removed)**
```bash
# Steps:
1. While logged in, click "Sair" or navigate to /api/auth/logout
2. Check DevTools → Application → Cookies
3. Refresh page

# Expected:
- Cookie 'token' DELETED (not visible in DevTools)
- Redirected to /login
- Cannot access /dashboard
```

**Verification**:
```bash
# In browser console:
document.cookie  // Should NOT contain 'token='
```

**Expected**: ✅ Cookie deleted, logged out

---

### **5. Refresh After Logout (Stays Logged Out)**
```bash
# Steps:
1. After logout, press F5
2. Try to navigate to /dashboard directly

# Expected:
- Stays on /login
- /dashboard redirects to /login
- NO cookie in DevTools
```

**Expected**: ✅ Logout persistent, cannot access protected routes

---

## 🧪 **Edge Cases Tested**

### **A. Expired Token**
```bash
# Scenario: JWT expired (> 7 days old)
# Before: Middleware decoded and redirected with flicker
# After: Middleware allows through, backend /auth/me returns 401

# Steps:
1. Set cookie with expired JWT (manually or wait 7 days)
2. Navigate to /dashboard

# Expected:
- Middleware allows (doesn't check exp)
- Dashboard component calls /auth/me
- API returns 401
- Frontend redirects to /login
```

**Result**: ✅ No flicker, clean redirect on API error

---

### **B. Malformed Token**
```bash
# Scenario: Cookie contains invalid JWT
# Before: Middleware tried to decode, failed, cleared cookie
# After: Middleware allows, backend rejects

# Steps:
1. Set cookie 'token=invalid-jwt-string'
2. Navigate to /dashboard

# Expected:
- Middleware allows
- API returns 401
- Frontend clears token and redirects
```

**Result**: ✅ Graceful handling, no middleware errors

---

### **C. SUPER_ADMIN Role Check**
```bash
# Scenario: USER tries to access /platform
# Before: Middleware checked role from JWT
# After: Middleware allows, backend enforces via requireRole

# Steps:
1. Login as USER (role='USER')
2. Navigate to /platform

# Expected:
- Middleware allows through
- Backend /platform routes use requireRole('SUPER_ADMIN')
- API returns 403 Forbidden
- Frontend shows access denied or redirects
```

**Result**: ✅ Backend enforces, frontend respects 403

---

## 📊 **Before vs After**

| Aspect | Before | After |
|--------|--------|-------|
| **Middleware JWT Decode** | ✅ Yes (client-side) | ❌ No (backend only) |
| **Flicker on Refresh** | ❌ Yes (exp check) | ✅ No (cookie check) |
| **Logout Works** | ⚠️ Sometimes (attr mismatch) | ✅ Always (consistent) |
| **Cookie Config** | ❌ Duplicated | ✅ Centralized helper |
| **Env-Driven Domain** | ❌ Hardcoded | ✅ COOKIE_DOMAIN env |
| **Role Check** | ⚠️ Middleware (stale JWT) | ✅ Backend (fresh) |

---

## 🚀 **Deployment Notes**

### **Local (Dev)**
```env
# .env (backend)
NODE_ENV=development
COOKIE_DOMAIN=  # Empty = host-only

# .env.local (frontend)
NEXT_PUBLIC_COOKIE_DOMAIN=  # Empty
```

**Restart required**: Yes (both frontend + backend)

---

### **Production**
```env
# .env (backend)
NODE_ENV=production
COOKIE_DOMAIN=.orbitup.io  # Cross-subdomain

# .env.local (frontend)
NEXT_PUBLIC_COOKIE_DOMAIN=.orbitup.io
```

**Deployment Steps**:
1. Update `.env` files
2. Rebuild: `npm run build`
3. Restart PM2: `pm2 restart all`
4. Test login/logout flow
5. Monitor for auth errors in logs

---

## 🔍 **Validation Commands**

```bash
# 1. Check middleware doesn't decode JWT
grep -r "parseJwtPayload\|atob" src/middleware.ts
# Expected: No matches

# 2. Check cookie config consistency
grep -A5 "getCookieConfig" core-api/src/controllers/auth.controller.ts
# Expected: Function defined and used in login/logout

# 3. Verify no JWT_SECRET in frontend
grep -r "JWT_SECRET" src/
# Expected: No matches (only in backend)

# 4. Test cookie attributes match
# Login → Check cookie attributes
# Logout → Check cookie deleted (not just expired)
```

---

## 📋 **Rollback Plan**

If issues occur:

```bash
# 1. Revert commits
git revert <commit-hash>

# 2. Restart services
npm run dev  # or pm2 restart all

# 3. Clear browser cookies manually
# DevTools → Application → Cookies → Delete all
```

**Worst case**: Users need to logout/login once after rollback.

---

## 🎯 **Success Metrics**

- ✅ Zero flicker reports on refresh
- ✅ Logout works 100% of the time
- ✅ No JWT_SECRET errors in frontend logs
- ✅ Middleware performance improved (no JWT decode)
- ✅ Cookie config centralized (easier maintenance)

---

**Implementation Time**: ~30 minutes  
**Testing Time**: ~15 minutes  
**Total Effort**: ~45 minutes
