import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAMES = ['token', 'orbitos_token', 'orbitos_current_org', 'orbitos_active_org'];

function clearCookies(response: NextResponse) {
    COOKIE_NAMES.forEach(name => {
        response.cookies.set(name, '', { maxAge: 0, path: '/', sameSite: 'lax' });
    });
}

function getPublicOrigin(request: NextRequest): string {
    // Quando Next.js está atrás de um reverse proxy (Nginx), o request.url
    // é a URL interna (ex: http://localhost:3001). Precisamos usar os headers
    // x-forwarded-proto e x-forwarded-host para reconstruir a URL pública.
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');

    if (forwardedProto && forwardedHost) {
        // Em produção atrás do Nginx: https://orbitup.io
        return `${forwardedProto}://${forwardedHost}`;
    }

    // Em desenvolvimento: usa o origin da request.url (http://localhost:3001)
    try {
        return new URL(request.url).origin;
    } catch {
        return 'http://localhost:3001';
    }
}

// GET /api/auth/logout — limpa cookie E redireciona para /login num único response
// Sem fetch, sem async no client, sem race condition
export async function GET(request: NextRequest) {
    const origin = getPublicOrigin(request);
    const response = NextResponse.redirect(`${origin}/login`);
    clearCookies(response);
    return response;
}

// POST /api/auth/logout — só limpa cookie (para uso via fetch())
export async function POST() {
    const response = NextResponse.json({ success: true });
    clearCookies(response);
    return response;
}
