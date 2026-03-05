// src/lib/auth.ts  
// Centralized auth utilities — relies on HttpOnly cookies set by core-API

const ORG_KEY = 'orbitos_current_org';

// Guard para evitar múltiplos logouts paralelos
let isLoggingOut = false;

// ─── Token Reading (deprecated — auth is now cookie-based) ───────────────────

/**
 * @deprecated Token is now managed server-side via HttpOnly cookie.
 * This function exists only for legacy compatibility and returns null.
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return null; // Tokens are HttpOnly, not readable by JS
};

/**
 * @deprecated Token is now set server-side only via /auth/discord/callback.
 * This function is a no-op for compatibility.
 */
export const setToken = (token: string): void => {
    // No-op: tokens are set server-side via Set-Cookie headers
    console.warn('[AUTH] setToken() is deprecated. Use server-side cookie flow.');
};

// ─── Clean legacy storage ────────────────────────────────────────────────────
export const clearTokenStorage = (): void => {
    if (typeof window === 'undefined') return;

    // Clear any legacy localStorage keys (migration cleanup)
    localStorage.removeItem(ORG_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('orbitos_token');
    localStorage.removeItem('orbitos_current_org');
    localStorage.removeItem('orbitos_original_token');
    localStorage.removeItem('orbitos_active_org');

    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('orbitos_token');
    sessionStorage.removeItem(ORG_KEY);
};

export const exitImpersonation = (): void => {
    if (typeof window === 'undefined') return;
    const originalToken = localStorage.getItem('orbitos_original_token');
    if (originalToken) {
        localStorage.removeItem('orbitos_original_token');
        localStorage.removeItem('orbitos_active_org');
        // Trigger re-authentication flow
        window.location.href = '/platform';
    }
};

// Alias legado
export const removeToken = clearTokenStorage;

// ─── Logout Centralizado ─────────────────────────────────────────────────────

export const logout = async (opts?: { redirect?: boolean }) => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    try {
        clearTokenStorage();

        // Use GET redirect to logout endpoint which clears cookies AND redirects
        // This avoids race condition between Set-Cookie and JavaScript redirect
        if (opts?.redirect !== false && typeof window !== 'undefined') {
            window.location.href = '/api/auth/logout';
        }
    } catch (e) {
        if (opts?.redirect !== false && typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    } finally {
        setTimeout(() => { isLoggingOut = false; }, 1500);
    }
};


// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * @deprecated Cannot reliably check auth client-side with HttpOnly cookies.
 * Use server-side checks (middleware) or call /auth/me.
 */
export const isAuthenticated = (): boolean => {
    console.warn('[AUTH] isAuthenticated() deprecated with HttpOnly cookies. Use /auth/me or SSR.');
    return false; // Cannot read HttpOnly cookie from JS
};
