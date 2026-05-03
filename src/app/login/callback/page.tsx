'use client';

import { useEffect, Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

/* FIX: In dev StrictMode, component can unmount/remount and re-run callback.
 * Keep processed OAuth codes at module scope to avoid reusing single-use codes. */
const processedOAuthCodes = new Set<string>();

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const hasProcessedRef = useRef(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        /* FIX: In React StrictMode (dev), useEffect can run twice.
         * OAuth code is single-use, so we must prevent duplicate callback POSTs. */
        if (hasProcessedRef.current) return;

        // Discord/GitHub retornou erro direto na URL
        if (errorParam) {
            hasProcessedRef.current = true;
            console.error('[CALLBACK] Provider retornou erro:', errorParam);
            setErrorMsg(`Acesso recusado: ${errorParam}`);
            setTimeout(() => router.push('/login?error=auth_denied'), 3000);
            return;
        }

        if (!code) {
            hasProcessedRef.current = true;
            router.push('/login');
            return;
        }

        /* FIX: Deduplicate code exchange across remounts in Next dev mode. */
        if (processedOAuthCodes.has(code)) {
            console.warn('[CALLBACK] Código OAuth já processado nesta sessão. Ignorando duplicata.');
            return;
        }

        hasProcessedRef.current = true;
        processedOAuthCodes.add(code);

        const provider = searchParams.get('provider') || 'discord';
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
        
        // Redireciona para o endpoint correto do backend (Discord ou GitHub)
        window.location.replace(`${apiBase}/auth/${provider}/callback?code=${encodeURIComponent(code)}`);
    }, [code, errorParam, router, searchParams]);

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4">
                <AlertCircle className="w-12 h-12 text-destructive mb-2" />
                <h2 className="text-xl font-semibold text-destructive">Falha na autenticação</h2>
                <p className="text-muted-foreground text-sm max-w-sm text-center">{errorMsg}</p>
                <p className="text-xs text-muted-foreground">Redirecionando para o login em 8 segundos...</p>
                <a href="/login" className="mt-2 text-sm text-violet-400 hover:underline">Voltar agora</a>
            </div>
        );
    }

    const providerName = searchParams.get('provider') === 'github' ? 'GitHub' : 'Discord';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-violet-500/5 animate-ping" />
            </div>
            <h2 className="text-xl font-semibold">Autenticando com {providerName}</h2>
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
