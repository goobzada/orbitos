// src/lib/api.ts
import axios from 'axios';
import { logout } from './auth';
import { toast } from 'sonner';

// ─── Instância Axios ─────────────────────────────────────────────────────────

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    timeout: 10_000,
    withCredentials: true,   // Send HttpOnly cookies automatically
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

// ─── Request Interceptor (no-op — auth is cookie-based) ──────────────────────
// Cookies are sent automatically via withCredentials: true.
// No need to manually inject Authorization headers.

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
                // Detectar idioma para o toast fora do contexto do React
                const langMatch = document.cookie.match(/(?:^|;)\s*app_lang=([^;]*)/);
                const lang = (langMatch ? decodeURIComponent(langMatch[1]) : 'pt-BR') as 'pt-BR' | 'en-US' | 'es-ES';

                const messages = {
                    'pt-BR': { title: 'Servidor indisponível', desc: 'A API do OrbitUp.io está offline ou sua conexão falhou.' },
                    'en-US': { title: 'Server unavailable', desc: 'The OrbitUp.io API is offline or your connection failed.' },
                    'es-ES': { title: 'Servidor no disponible', desc: 'La API de OrbitUp.io está desconectada o tu conexión falló.' }
                };

                const msg = messages[lang] || messages['pt-BR'];

                toast.error(msg.title, {
                    description: msg.desc,
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

        // ── 4. Página de callback OAuth → NÃO derrubar sessão ────────────────
        // Race condition: o Next.js layout monta e faz requisições antes do
        // token ser salvo no localStorage/cookie durante o callback do Discord.
        // Ignorar todos os erros 401 enquanto estamos no /login/callback.
        const isCallbackPage = typeof window !== 'undefined'
            && window.location.pathname.startsWith('/login/callback');

        if (isCallbackPage) {
            console.warn('[API] Erro 401 ignorado — estamos no callback OAuth (race condition prevenida).', { url, status });
            return Promise.reject(error);
        }

        // ── 5. Sessão inválida: 401 ou usuário deletado (404 em /auth/me) ─────
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

            // Reseta o guard após 3s para não bloquear permanentemente
            setTimeout(() => { isHandlingAuthError = false; }, 3000);
        }

        return Promise.reject(error);
    }
);

export default api;
