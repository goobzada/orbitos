import { NextResponse } from 'next/server';

// DELETE /api/auth/logout — apaga o cookie server-side (100% confiável)
export async function POST() {
    const response = NextResponse.json({ success: true });

    // Apaga o cookie token em todas as variações
    const cookieNames = ['token', 'orbitos_token'];
    for (const name of cookieNames) {
        response.cookies.set(name, '', {
            maxAge: 0,
            path: '/',
            sameSite: 'lax',
            httpOnly: false,
        });
    }

    return response;
}
