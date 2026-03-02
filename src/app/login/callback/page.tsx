'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    useEffect(() => {
        if (code) {
            const handleCallback = async () => {
                try {
                    // Communicate with Core API to exchange code for JWT
                    const { data } = await api.post('/auth/discord/callback', { code });

                    if (data.token) {
                        setToken(data.token);
                        router.push('/dashboard');
                    } else {
                        console.error('Token not found in response');
                        router.push('/login?error=token_not_found');
                    }
                } catch (error) {
                    console.error('Auth error:', error);
                    router.push('/login?error=auth_failed');
                }
            };

            handleCallback();
        } else {
            router.push('/login');
        }
    }, [code, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-medium">Autenticando...</h2>
            <p className="text-muted-foreground">Por favor, aguarde enquanto processamos seu login.</p>
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
