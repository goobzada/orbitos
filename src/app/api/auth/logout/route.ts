import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAMES = ['token', 'orbitos_token', 'orbitos_current_org', 'orbitos_active_org'];

function clearCookies(response: NextResponse) {
    const isProduction = process.env.NODE_ENV === 'production';

    COOKIE_NAMES.forEach(name => {
        // Clear host-only cookie
        response.cookies.set({
            name,
            value: '',
            path: '/',
            maxAge: 0,
            expires: new Date(0),
            sameSite: 'lax',
        });

        // Clear production cross-subdomain cookie
        if (isProduction) {
            response.cookies.set({
                name,
                value: '',
                path: '/',
                maxAge: 0,
                expires: new Date(0),
                sameSite: 'none',
                secure: true,
                domain: '.orbitup.io',
            });
        }
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
    const response = NextResponse.redirect(`${origin}/login`);
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
