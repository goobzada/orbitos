'use client';

// Garante que esta página NUNCA seja pre-renderizada estaticamente.
// Sem isso, o Next.js renderiza sem query params → code=null → redirect para /login
export const dynamic = 'force-dynamic';

import { useEffect, useRef, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Loader2, AlertCircle } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    // 🔒 Garante que a troca do code acontece UMA única vez.
    // O router muda referência no Next.js causando re-execução do useEffect
    // com o mesmo code → Discord rejeita com invalid_grant (código single-use).
    const exchanged = useRef(false);

    useEffect(() => {
        // Já trocou — evita double-call
        if (exchanged.current) return;

        // Discord retornou erro direto na URL
        if (errorParam) {
            exchanged.current = true;
            console.error('[CALLBACK] Discord retornou erro:', errorParam);
            setErrorMsg(`Discord recusou o acesso: ${errorParam}`);
            setTimeout(() => router.push('/login?error=discord_denied'), 3000);
            return;
        }

        if (!code) {
            router.push('/login');
            return;
        }

        // Marca como trocado ANTES de chamar a API para evitar race condition
        exchanged.current = true;

        const handleCallback = async () => {
            try {
                console.log('[CALLBACK] Trocando code por JWT...');

                const { data } = await api.post('/auth/discord/callback', { code });

                console.log('[CALLBACK] Resposta da API:', {
                    hasToken: !!data.token,
                    hasUser: !!data.user,
                    username: data.user?.username,
                });

                if (data.token) {
                    setToken(data.token);
                    console.log('[CALLBACK] ✅ Token salvo. Redirecionando para /dashboard...');
                    window.location.replace('/dashboard');
                } else {
                    console.error('[CALLBACK] ❌ API respondeu sem token:', data);
                    setErrorMsg('Servidor não retornou o token de autenticação.');
                    setTimeout(() => router.push('/login?error=no_token'), 3000);
                }
            } catch (error: any) {
                const status = error?.response?.status;
                const detail = error?.response?.data?.error || error?.message || 'Erro desconhecido';

                console.error('[CALLBACK] ❌ Falha na troca do code:', { status, detail });
                setErrorMsg(`Falha na autenticação (${status || 'rede'}): ${detail}`);
                setTimeout(() => router.push(`/login?error=auth_failed&detail=${encodeURIComponent(detail)}`), 4000);
            }
        };

        handleCallback();
    }, [code, errorParam]); // ← router removido das deps — não deve re-disparar a troca

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
