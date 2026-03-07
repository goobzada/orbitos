'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { buildTheme, themeToCSS, ThemeTokens } from '@/lib/theme';

function storeHref(slug: string, path: string): string {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/s/')) {
        return path || '/';
    }
    return `/s/${slug}${path}`;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StoreCancelPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [theme, setTheme] = useState<ThemeTokens | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API_URL}/public/portal/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    const identity = data.identity || {};
                    const preset = identity.preset || { config: {} };
                    setTheme(buildTheme(identity, preset));
                }
            } catch {
                // silent
            }
        }
        if (slug) load();
    }, [slug]);

    return (
        <>
            {theme && <style dangerouslySetInnerHTML={{ __html: `:root { ${themeToCSS(theme)} }` }} />}
            <div className="min-h-screen text-white flex flex-col" style={{ background: 'var(--color-background, #0a0a0f)' }}>
            <header className="border-b border-white/5" style={{ background: 'var(--color-nav-bg, #0d0d18)' }}>
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href={storeHref(slug, '/store')}
                        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Voltar Ã  loja
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="text-center max-w-sm space-y-7">
                    {/* Icon */}
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                        <XCircle className="w-12 h-12 text-red-400" />
                    </div>

                    {/* Heading */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black tracking-tight">Compra cancelada</h1>
                        <p className="text-white/40 leading-relaxed text-sm">
                            Nenhuma cobranÃ§a foi realizada. VocÃª pode retornar Ã  loja e tentar novamente quando quiser.
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={storeHref(slug, '/store')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
                            style={{ background: 'var(--color-primary, #7c3aed)', color: 'var(--color-btn-text, #fff)' }}
                        >
                            <RotateCcw size={14} />
                            Tentar novamente
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
