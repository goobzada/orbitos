// src/lib/auth.ts
// Chaves usadas para armazenar o token e a org selecionada
const TOKEN_KEY = 'token';
const ORG_KEY = 'orbitos_current_org';

// Guard para evitar múltiplos logouts paralelos
let isLoggingOut = false;

// ─── Leitura do Token ────────────────────────────────────────────────────────

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    // 1) Tenta localStorage
    const local = localStorage.getItem(TOKEN_KEY);
    if (local) return local;

    // 2) Fallback: cookie (pode vir do middleware SSR)
    const match = document.cookie.match(/(?:^|;)\s*token=([^;]*)/);
    if (match && match[1]) {
        const cookieToken = decodeURIComponent(match[1]);
        localStorage.setItem(TOKEN_KEY, cookieToken); // sincroniza
        return cookieToken;
    }

    return null;
};

// ─── Gravação do Token ───────────────────────────────────────────────────────

export const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(TOKEN_KEY, token);
    // Cookie com 7 dias para o middleware Next.js ler no SSR (igual ao JWT)
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
};

// ─── Limpeza de Storage ──────────────────────────────────────────────────────

export const clearTokenStorage = (): void => {
    if (typeof window === 'undefined') return;

    // localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ORG_KEY);
    localStorage.removeItem('orbitos_token');
    localStorage.removeItem('orbitos_current_org');
    localStorage.removeItem('orbitos_original_token');
    localStorage.removeItem('orbitos_active_org');

    // sessionStorage
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('orbitos_token');
    sessionStorage.removeItem(ORG_KEY);

    // Apaga cookie client-side (fallback)
    const cookiesToClear = [TOKEN_KEY, 'orbitos_token', ORG_KEY, 'orbitos_current_org'];
    for (const name of cookiesToClear) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    }
};

export const exitImpersonation = (): void => {
    if (typeof window === 'undefined') return;
    const originalToken = localStorage.getItem('orbitos_original_token');
    if (originalToken) {
        setToken(originalToken); // atualiza localStorage + cookie
        localStorage.removeItem('orbitos_original_token');
        localStorage.removeItem('orbitos_active_org');
        window.location.replace('/platform');
    }
};

// Alias legado (usado em alguns lugares)
export const removeToken = clearTokenStorage;

// ─── Logout Centralizado ─────────────────────────────────────────────────────

export const logout = (opts?: { redirect?: boolean }): void => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    try {
        clearTokenStorage(); // limpa client-side imediatamente

        if (opts?.redirect !== false && typeof window !== 'undefined') {
            // Navegar para GET /api/auth/logout que limpa o cookie
            // e redireciona para /login num único response server-side.
            // Sem fetch, sem async, sem race condition.
            window.location.replace('/api/auth/logout');
        }
    } finally {
        setTimeout(() => { isLoggingOut = false; }, 1500);
    }
};


// ─── Helpers ─────────────────────────────────────────────────────────────────

export const isAuthenticated = (): boolean => {
    return !!getToken();
};
