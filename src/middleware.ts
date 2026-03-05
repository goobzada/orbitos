import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rotas que NÃO precisam de autenticação
const PUBLIC_PATHS = ['/', '/login', '/auth', '/s'];

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

    // Verificar JWT e extrair role
    let role = 'USER';
    let tokenValid = true;
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('[MIDDLEWARE] JWT_SECRET missing — cannot verify tokens');
            tokenValid = false;
        } else {
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);
            role = (payload.role as string) || 'USER';
        }
    } catch (err) {
        tokenValid = false;
    }

    // Token inválido → limpa cookie e redireciona para /login
    if (!tokenValid) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('session_expired', '1');

        const resp = NextResponse.redirect(url);
        resp.cookies.set({
            name: 'token',
            value: '',
            maxAge: 0,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
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
