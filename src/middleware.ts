import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Middleware de Roteamento OrbitUp.io ─────────────────────────────────────
// NOTA: A verificação de JWT foi movida para a API (auth.middleware.ts).
// O middleware do Next.js apenas verifica a PRESENÇA do cookie de sessão.
// Isso evita problemas de "invalid signature" causados por divergência de
// JWT_SECRET entre o Edge Runtime do Next.js e o Node.js da API.
// A segurança real é garantida pela API em cada endpoint protegido.

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Lê o token do cookie de sessão
    const token =
        request.cookies.get('token')?.value ||
        request.cookies.get('orbitos_token')?.value;

    const isDashboard = pathname.startsWith('/dashboard');
    const isPlatform = pathname.startsWith('/platform');
    const isPlataforma = pathname.startsWith('/plataforma');

    // /login/callback e /auth/* devem SEMPRE passar — o code precisa ser processado
    const isCallback = pathname.startsWith('/login/callback') || pathname.startsWith('/auth/');
    const isLoginExact = pathname === '/login';
    const isProtected = isDashboard || isPlatform;

    // Redireciona /plataforma → /platform
    if (isPlataforma) {
        return NextResponse.redirect(new URL('/platform', request.url));
    }

    // Callbacks OAuth: NUNCA interceptar
    if (isCallback) {
        return NextResponse.next();
    }

    // Força limpeza de cookie (break loop)
    if (request.nextUrl.searchParams.get('clear') === '1') {
        const url = request.nextUrl.clone();
        url.searchParams.delete('clear');
        const resp = NextResponse.redirect(url);
        resp.cookies.set('token', '', { maxAge: 0, path: '/' });
        return resp;
    }

    // ── Sem token ──────────────────────────────────────────────────────────────
    if (!token) {
        if (isProtected) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // ── Com token (qualquer valor — API valida) ────────────────────────────────

    // Tenta ler o role do JWT sem verificar assinatura (decode simples)
    // Apenas para redirecionar /platform vs /dashboard
    let role = 'USER';
    try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(
                Buffer.from(parts[1], 'base64url').toString('utf-8')
            );
            role = payload.role || 'USER';
        }
    } catch {
        // fallback ok — role permanece 'USER'
    }

    // Já logado tentando acessar /login → redireciona para o dashboard
    if (isLoginExact) {
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
    matcher: [
        '/dashboard/:path*',
        '/platform/:path*',
        '/login',
        '/login/:path*',
    ],
};
