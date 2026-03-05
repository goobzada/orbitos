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

    // Redireciona /plataforma -> /platform (Suporte PT-BR)
    if (isPlataforma) {
        return NextResponse.redirect(new URL('/platform', request.url));
    }

    // ── Força limpeza de cookie pedida pelo client (Break Loop) ───────────────
    if (request.nextUrl.searchParams.get('clear') === '1') {
        const url = request.nextUrl.clone();
        url.searchParams.delete('clear');
        const resp = NextResponse.redirect(url);
        resp.cookies.set({ name: 'token', value: '', maxAge: 0, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        return resp;
    }

    // ── Sem token ─────────────────────────────────────────────────────────────
    if (!token) {
        // Rota privada sem token → redireciona para /login preservando destino
        if (isProtected) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }
        // Qualquer rota pública → deixa passar
        return NextResponse.next();
    }

    // ── Com token ─────────────────────────────────────────────────────────────

    // Tenta extrair o role do JWT com verificação de assinatura no Edge via jose
    let role = 'USER';
    let tokenValid = true;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production');
        const { payload } = await jwtVerify(token, secret);
        role = (payload.role as string) || 'USER';
    } catch (err) {
        tokenValid = false;
    }

    // Token malformado ou expirado → limpa cookie e redireciona pro /login
    if (!tokenValid) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        if (isProtected) url.searchParams.set('from', pathname);

        const resp = NextResponse.redirect(url);
        resp.cookies.set({ name: 'token', value: '', maxAge: 0, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        return resp;
    }

    // Já logado e tentando acessar /login → redireciona para dashboard correto
    // MAS não redireciona durante o callback OAuth (o callback precisa processar o code)
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
    // Roda apenas nas rotas privadas, login e callbacks OAuth.
    // Exclui assets estáticos, _next, portais públicos e favicon.
    matcher: [
        '/dashboard/:path*',
        '/platform/:path*',
        '/login',
        '/login/:path*',
    ],
};
