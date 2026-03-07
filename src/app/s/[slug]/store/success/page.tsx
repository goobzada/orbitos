'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { buildTheme, themeToCSS, ThemeTokens } from '@/lib/theme';

function storeHref(slug: string, path: string): string {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/s/')) {
        return path || '/';
    }
    return `/s/${slug}${path}`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StoreSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const sessionId = searchParams.get('session_id');

    const [orgName, setOrgName] = useState('');
    const [theme, setTheme] = useState<ThemeTokens | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API_URL}/public/portal/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrgName(data.organization?.name || slug);
                    const identity = data.identity || {};
                    const preset = identity.preset || { config: {} };
                    setTheme(buildTheme(identity, preset));
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }
        if (slug) load();
    }, [slug]);

    return (
        <>
            {theme && <style dangerouslySetInnerHTML={{ __html: `:root { ${themeToCSS(theme)} }` }} />}
            <div className="min-h-screen text-white flex flex-col" style={{ background: 'var(--color-background, #0a0a0f)' }}>
            <header className="border-b border-white/5" style={{ background: 'var(--color-nav-bg, #0d0d18)' }}>
                <div className="max-w-2xl mx-auto px-6 py-4 text-sm font-semibold text-white/40">
                    {orgName || slug}
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="text-center max-w-md space-y-8">
                    {/* Icon */}
                    <div className="relative inline-flex">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
                        >
                            <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span className="absolute -top-1 -right-1 animate-bounce">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black tracking-tight">Compra realizada!</h1>
                        <p className="text-white/50 leading-relaxed">
                            Seu pagamento foi confirmado com sucesso.
                            A entrega do seu benefício no Discord será processada automaticamente em breve.
                        </p>
                    </div>

                    {/* Info box */}
                    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-sm space-y-3 text-left">
                        <p className="font-bold text-white/70">O que acontece agora?</p>
                        <ul className="space-y-2 text-white/40 text-[13px]">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5" style={{ color: 'var(--color-primary)' }}>1.</span>
                                <span>Nosso sistema está verificando o pagamento junto ao Stripe.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5" style={{ color: 'var(--color-primary)' }}>2.</span>
                                <span>Após confirmação, o cargo/acesso será entregue automaticamente no Discord.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5" style={{ color: 'var(--color-primary)' }}>3.</span>
                                <span>Você receberá uma notificação no Discord quando a entrega for concluída.</span>
                            </li>
                        </ul>
                        {sessionId && (
                            <div className="pt-2 border-t border-white/5">
                                <p className="text-[11px] text-white/20 font-mono break-all">
                                    Referência: {sessionId}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={storeHref(slug, '/store')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
                            style={{ background: 'var(--color-primary)', color: 'var(--color-btn-text, #fff)' }}
                        >
                            <ExternalLink size={14} />
                            Voltar à loja
                        </Link>
                        <Link
                            href={storeHref(slug, '')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-bold text-sm transition-all border border-white/10"
                        >
                            Ir para a comunidade
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/5">
                <div className="max-w-2xl mx-auto px-6 py-5 text-xs text-white/20 text-center">
                    Powered by <a href="https://orbitup.io" className="hover:underline" style={{ color: 'var(--color-primary)' }}>OrbitOS</a>
                </div>
            </footer>
        </div>
        </>
    );
}
