// src/lib/api.ts
import axios from 'axios';
import { logout } from './auth';
import { toast } from 'sonner';

// ─── Instância Axios ─────────────────────────────────────────────────────────

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    timeout: 10_000,
    withCredentials: true,   // envia cookies (token) cross-site automaticamente
    headers: {
        'Content-Type': 'application/json',
    },
});

// Guard: evita múltiplos redirecionamentos simultâneos para /login
let isHandlingAuthError = false;

// Rotas de polling/health que NUNCA devem derrubar a sessão
// (mesmo que retornem 401, pois podem ser rotas públicas ou de monitoramento)
const SAFE_POLL_ROUTES = [
    '/health',
    '/stats/overview',
    '/stats/audit/recent',
    '/stats/',
];

function isSafePollRoute(url: string): boolean {
    return SAFE_POLL_ROUTES.some((safe) => url.includes(safe));
}

// ─── Request Interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // Tenta localStorage primeiro
        let token = localStorage.getItem('token');

        // Fallback: cookie (útil logo após reload com SSR)
        if (!token) {
            const match = document.cookie.match(/(?:^|;)\s*token=([^;]*)/);
            if (match && match[1]) token = decodeURIComponent(match[1]);
        }

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url: string = error?.config?.url || '';

        // ── 1. Erro de rede / backend offline → NÃO derrubar sessão ──────────
        const isNetworkError = !error.response && !!error.request;
        const isServerDown = !status || status === 0 || status >= 500;

        if (isNetworkError || isServerDown) {
            console.warn('[API] Core API offline ou inacessível.', { url, status });
            error.isApiOffline = true;
            // Toast apenas uma vez (throttled pelo id único)
            if (typeof window !== 'undefined') {
                toast.error('Servidor indisponível', {
                    description: 'A API do OrbitUp.io está offline ou sua conexão falhou.',
                    id: 'global-api-offline',
                });
            }
            return Promise.reject(error);
        }

        // ── 2. Rota de poll/health → nunca derruba sessão ────────────────────
        // Evita que health checks ou stats polling causem logout/reload
        if (isSafePollRoute(url)) {
            console.warn('[API] Erro em rota de poll (ignorado para sessão):', { url, status });
            return Promise.reject(error);
        }

        // ── 3. Rotas puras de auth (/auth/login, /auth/callback) → sem logout ─
        const isAuthRoute = (url.includes('/auth') || url.includes('/login'))
            && !url.includes('/auth/me');

        if (isAuthRoute) {
            return Promise.reject(error);
        }

        // ── 4. Sessão inválida: 401 ou usuário deletado (404 em /auth/me) ─────
        const isAuthMe404 = status === 404 && url.includes('/auth/me');
        const isUnauthorized = status === 401;

        if ((isUnauthorized || isAuthMe404) && !isHandlingAuthError) {
            isHandlingAuthError = true;

            console.warn('[API] Sessão inválida ou expirada. Forçando logout.', { status, url });

            // Notifica outros componentes (ex: fechar modais abertos)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('orbitos:unauthorized'));
            }

            // Limpa tokens e redireciona para /login (uma única vez)
            logout({ redirect: true });
        }

        return Promise.reject(error);
    }
);

export default api;
