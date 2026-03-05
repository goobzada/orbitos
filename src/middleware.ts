import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* FIX A: Middleware should ONLY check cookie presence, not decode/verify JWT.
 * Backend is source of truth. Avoids flicker when JWT_SECRET missing on frontend. */

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    /* FIX: Support legacy cookie name to avoid false unauth redirects during transition. */
    const token = request.cookies.get('token')?.value || request.cookies.get('orbitos_token')?.value;

    const isDashboard = pathname.startsWith('/dashboard');
    const isPlatform = pathname.startsWith('/platform');
    const isPlataforma = pathname.startsWith('/plataforma');
    const isLogin = pathname === '/login' || pathname.startsWith('/login/');
    const isProtected = isDashboard || isPlatform;

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
    /* FIX A: Exclude static assets to avoid unnecessary middleware runs */
    matcher: [
        '/dashboard/:path*',
        '/platform/:path*',
        '/login',
        '/login/:path*',
    ],
};
