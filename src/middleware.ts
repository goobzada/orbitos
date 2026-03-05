import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type JwtPayloadLite = {
    role?: string;
    exp?: number;
};

function parseJwtPayload(token: string): JwtPayloadLite | null {
    try {
        const payloadPart = token.split('.')[1];
        if (!payloadPart) return null;

        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

function clearAuthCookie(response: NextResponse) {
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set({
        name: 'token',
        value: '',
        maxAge: 0,
        path: '/',
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        ...(isProduction ? { domain: '.orbitup.io' } : {}),
    });
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

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
            // Only set 'from' if not already on a callback or error state
            if (!pathname.includes('/callback')) {
                url.searchParams.set('from', pathname);
            }
            return NextResponse.redirect(url);
        }
        // Qualquer rota pública → deixa passar
        return NextResponse.next();
    }

    // ── Com token ─────────────────────────────────────────────────────────────

    // Read JWT payload without secret to avoid frontend runtime dependency on JWT_SECRET.
    const payload = parseJwtPayload(token);
    const role = typeof payload?.role === 'string' ? payload.role : 'USER';
    const nowSec = Math.floor(Date.now() / 1000);
    const isExpired = typeof payload?.exp === 'number' && payload.exp <= nowSec;
    const isMalformed = payload === null;

    // Expired/malformed cookie should be cleared to stop redirect loops.
    if (isExpired || isMalformed) {
        const resp = isProtected
            ? NextResponse.redirect(new URL('/login?session_expired=1', request.url))
            : NextResponse.next();
        clearAuthCookie(resp);
        return resp;
    }

    // Já autenticado tentando acessar /login → redireciona para dashboard
    // EXCETO durante callback OAuth (precisa processar o code)
    const isCallback = pathname.startsWith('/login/callback');
    if (isLogin && !isCallback) {
        const dest = role === 'SUPER_ADMIN' ? '/platform' : '/dashboard';
        return NextResponse.redirect(new URL(dest, request.url));
    }

    // USER tentando acessar /platform → bloqueia
    if (isPlatform && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}


export const config = {
    // Run only on protected routes + login flow
    // Exclude static assets, _next, public portals
    matcher: [
        '/dashboard/:path*',
        '/platform/:path*',
        '/login',
        '/login/:path*',
    ],
};
