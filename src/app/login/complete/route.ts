import { NextRequest, NextResponse } from 'next/server';

function resolveApiBase(request: NextRequest): string {
    const internalApiUrl = process.env.INTERNAL_API_URL?.trim();
    if (internalApiUrl) {
        return internalApiUrl.replace(/\/+$/, '');
    }

    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (publicApiUrl) {
        try {
            const parsed = new URL(publicApiUrl);
            const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;

            if (parsed.host !== requestHost) {
                return publicApiUrl.replace(/\/+$/, '');
            }
        } catch {
            // Fall through to local API fallback.
        }
    }

    return 'http://127.0.0.1:4000';
}

function redirectToLogin(request: NextRequest, error: string, detail?: string) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', error);
    if (detail) {
        url.searchParams.set('detail', detail);
    }
    return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const oauthError = request.nextUrl.searchParams.get('error');

    if (oauthError) {
        return redirectToLogin(request, 'discord_denied', oauthError);
    }

    if (!code) {
        return redirectToLogin(request, 'no_token', 'Código OAuth ausente.');
    }

    try {
        const apiBase = resolveApiBase(request);
        const response = await fetch(`${apiBase}/auth/discord/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-forwarded-host': request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host,
                'x-forwarded-proto': request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', ''),
            },
            body: JSON.stringify({ code }),
            redirect: 'manual',
            cache: 'no-store',
        });

        if (!response.ok) {
            let detail = 'Falha interna durante o callback do Discord';

            try {
                const data = await response.json();
                detail = data?.error_description || data?.error || data?.details?.error || detail;
            } catch {
                // Ignore JSON parse failure and keep default detail.
            }

            return redirectToLogin(request, 'discord_callback_failed', detail);
        }

        const redirectUrl = new URL('/dashboard', request.url);
        const nextResponse = NextResponse.redirect(redirectUrl);
        const setCookie = response.headers.get('set-cookie');

        if (setCookie) {
            nextResponse.headers.append('set-cookie', setCookie);
        }

        return nextResponse;
    } catch {
        return redirectToLogin(request, 'network', 'Não foi possível concluir o login com o servidor.');
    }
}