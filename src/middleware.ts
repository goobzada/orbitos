import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* FIX A: Middleware should ONLY check cookie presence, not decode/verify JWT.
 * Backend is source of truth. Avoids flicker when JWT_SECRET missing on frontend. */

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orbitup.io';
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || `app.${ROOT_DOMAIN}`;
const STORES_GATEWAY_DOMAIN = process.env.NEXT_PUBLIC_STORES_GATEWAY_DOMAIN || `stores.${ROOT_DOMAIN}`;
/*
 * Middleware runs server-side. Prefer an internal API URL to avoid
 * recursive calls to the web host (which can return 404 for API paths).
 */
const API_URL =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

function getHost(request: NextRequest): string {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host') || '';
    return host.split(':')[0].trim().toLowerCase();
}

function isPlatformHost(host: string): boolean {
    if (!host) return true;
    // Normaliza o host removendo www. para comparação
    const normalizedHost = host.replace(/^www\./, '');
    const normalizedRoot = ROOT_DOMAIN.replace(/^www\./, '');
    const normalizedApp = APP_DOMAIN.replace(/^www\./, '');

    if (normalizedHost === normalizedRoot || normalizedHost === normalizedApp || host === STORES_GATEWAY_DOMAIN) return true;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    return false;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = getHost(request);

    const isStaticAsset =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml';

    /* FIX: Support legacy cookie name to avoid false unauth redirects during transition. */
    const token = request.cookies.get('token')?.value || request.cookies.get('orbitos_token')?.value;

    const isDashboard = pathname.startsWith('/dashboard');
    const isPlatform = pathname.startsWith('/platform');
    const isPlataforma = pathname.startsWith('/plataforma');
    const isLogin = pathname === '/login' || pathname.startsWith('/login/');
    const isProtected = isDashboard || isPlatform;

    // Public storefront host resolver (custom domains and slug.orbicapp.com).
    if (!isStaticAsset && !pathname.startsWith('/s/') && !isProtected && !isLogin && !isPlatformHost(host)) {
        try {
            const params = new URLSearchParams({ host, path: pathname });
            const resolved = await fetch(`${API_URL}/public/store/resolve?${params.toString()}`, {
                headers: {
                    'x-forwarded-host': host,
                },
                cache: 'no-store',
            });

            if (resolved.ok) {
                const data = await resolved.json();
                const slug = data?.store?.slug as string | undefined;
                const canonical = data?.canonicalRedirectTo as string | null;

                if (canonical && canonical !== host) {
                    const redirectUrl = request.nextUrl.clone();
                    redirectUrl.hostname = canonical;
                    redirectUrl.protocol = request.headers.get('x-forwarded-proto') || 'https';
                    return NextResponse.redirect(redirectUrl, 301);
                }

                if (slug) {
                    const rewriteUrl = request.nextUrl.clone();
                    rewriteUrl.pathname = pathname === '/' ? `/s/${slug}` : `/s/${slug}${pathname}`;
                    return NextResponse.rewrite(rewriteUrl);
                }
            }

            if (resolved.status === 404) {
                return NextResponse.rewrite(new URL('/404', request.url));
            }
        } catch {
            // If resolver is unavailable, keep request flow alive.
        }
    }

    // Redireciona /plataforma → /platform (Suporte PT-BR)
    if (isPlataforma) {
        return NextResponse.redirect(new URL('/platform', request.url));
    }

    // ── Sem token ─────────────────────────────────────────────────────────────
    if (!token) {
        // Rota privada sem token → redireciona para /login preservando destino
        if (isProtected) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            /* FIX A: Loop-safe redirect - don't set 'from' on callbacks */
            if (!pathname.includes('/callback')) {
                url.searchParams.set('from', pathname);
            }
            return NextResponse.redirect(url);
        }
        // Qualquer rota pública → deixa passar
        return NextResponse.next();
    }

    // ── Com token ─────────────────────────────────────────────────────────────
    /* FIX A: No JWT decode here. Backend validates token on API calls.
     * Middleware just checks presence to avoid redirect loops. */

    // Já autenticado tentando acessar /login → redireciona para dashboard
    /* FIX A: Can't check role here (no JWT decode), so redirect to /dashboard.
     * Backend /auth/me will return proper user data including role. */
    const isCallback = pathname.startsWith('/login/callback');
    if (isLogin && !isCallback) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    /* FIX A: Platform role check removed - backend enforces via requireRole middleware. */

    return NextResponse.next();
}

export const config = {
    // Run for all app pages except API/static files.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
    ],
};
