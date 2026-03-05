'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        // Discord retornou erro direto na URL
        if (errorParam) {
            console.error('[CALLBACK] Discord retornou erro:', errorParam);
            setErrorMsg(`Discord recusou o acesso: ${errorParam}`);
            setTimeout(() => router.push('/login?error=discord_denied'), 3000);
            return;
        }

        if (!code) {
            router.push('/login');
            return;
        }

        const handleCallback = async () => {
            try {
                console.log('[CALLBACK] Trocando code por JWT...');

                const { data } = await api.post('/auth/discord/callback', { code });

                console.log('[CALLBACK] Resposta da API:', {
                    hasToken: !!data.token,
                    hasUser: !!data.user,
                    username: data.user?.username,
                });

                if (data.token && data.user) {
                    console.log('[CALLBACK] ✅ Authenticated. Cookie set server-side.');
                    
                    // Server already set HttpOnly cookie via Set-Cookie header.
                    // Redirect immediately — middleware will pick up the cookie.
                    window.location.replace('/dashboard');
                } else {
                    console.error('[CALLBACK] ❌ API respondeu sem token:', data);
                    setErrorMsg('Servidor não retornou o token de autenticação.');
                    setTimeout(() => router.push('/login?error=no_token'), 3000);
                }
            } catch (error: any) {
                const status = error?.response?.status;
                const discordError = error?.response?.data?.details?.error;
                const apiError = error?.response?.data?.error;
                const detail = discordError || apiError || error?.message || 'Erro desconhecido';

                console.error('[CALLBACK] ❌ Falha na troca do code:', { status, detail, discordError, apiError });

                // Mensagem amigável para erros conhecidos do Discord
                let friendlyMsg = `Falha na autenticação (${status || 'rede'}): ${detail}`;
                if (discordError === 'invalid_client') {
                    friendlyMsg = '❌ Discord recusou as credenciais da aplicação (invalid_client). O Client Secret no servidor está desatualizado. Contate o administrador.';
                } else if (discordError === 'invalid_grant') {
                    friendlyMsg = '❌ Código de autorização expirado ou já usado. Tente fazer login novamente.';
                } else if (discordError === 'redirect_uri_mismatch') {
                    friendlyMsg = '❌ Redirect URI não cadastrada no Discord Developer Portal.';
                }

                setErrorMsg(friendlyMsg);
                // Não redireciona automaticamente para não esconder o erro do usuário
                setTimeout(() => router.push(`/login?error=auth_failed&detail=${encodeURIComponent(detail)}`), 6000);
            }
        };

        handleCallback();
    }, [code, errorParam, router]);

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4">
                <AlertCircle className="w-12 h-12 text-destructive mb-2" />
                <h2 className="text-xl font-semibold text-destructive">Falha na autenticação</h2>
                <p className="text-muted-foreground text-sm max-w-sm text-center">{errorMsg}</p>
                <p className="text-xs text-muted-foreground">Redirecionando para o login...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-violet-500/5 animate-ping" />
            </div>
            <h2 className="text-xl font-semibold">Autenticando com Discord</h2>
            <p className="text-muted-foreground mt-2 text-sm">Aguarde, estamos validando seu acesso...</p>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-medium">Carregando...</h2>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
