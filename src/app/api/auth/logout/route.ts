import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAMES = ['token', 'orbitos_token', 'orbitos_current_org', 'orbitos_active_org'];

function clearCookies(response: NextResponse) {
    COOKIE_NAMES.forEach(name => {
        response.cookies.delete(name);
        response.cookies.set({
            name: name,
            value: '',
            path: '/',
            maxAge: 0,
            expires: new Date(0),
        });
    });
}

function getPublicOrigin(request: NextRequest): string {
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');

    if (forwardedProto && forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
    }

    try {
        return new URL(request.url).origin;
    } catch {
        return 'http://localhost:3000';
    }
}

// GET /api/auth/logout — limpa cookie E redireciona para /login
export async function GET(request: NextRequest) {
    const origin = getPublicOrigin(request);
    const response = NextResponse.redirect(`${origin}/login?clear=1`);
    clearCookies(response);
    return response;
}

// POST /api/auth/logout — limpa cookie e retorna JSON (ou redireciona)
export async function POST(request: NextRequest) {
    // Para funcionar em action calls via POST
    const origin = getPublicOrigin(request);
    const response = NextResponse.json({ success: true, redirectUrl: `${origin}/login` });
    clearCookies(response);
    return response;
}
