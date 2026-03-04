import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const COOKIE_NAMES = ['token', 'orbitos_token', 'orbitos_current_org', 'orbitos_active_org'];

// GET /api/auth/logout — limpa cookie E redireciona para /login num único response (sem race condition)
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const response = NextResponse.redirect(new URL('/login', `${url.protocol}//${url.host}`));

    COOKIE_NAMES.forEach(name => {
        response.cookies.set(name, '', { maxAge: 0, path: '/', sameSite: 'lax' });
    });

    return response;
}

// POST /api/auth/logout — limpa só o cookie (para fetch() async)
export async function POST() {
    const response = NextResponse.json({ success: true });

    COOKIE_NAMES.forEach(name => {
        response.cookies.set(name, '', { maxAge: 0, path: '/', sameSite: 'lax', httpOnly: false });
    });

    return response;
}
