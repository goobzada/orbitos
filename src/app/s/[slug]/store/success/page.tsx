'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, Sparkles, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StoreSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const sessionId = searchParams.get('session_id');

    const [orgName, setOrgName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API_URL}/public/portal/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrgName(data.organization?.name || slug);
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
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
            <header className="border-b border-white/5 bg-[#0d0d18]">
                <div className="max-w-2xl mx-auto px-6 py-4 text-sm font-semibold text-white/40">
                    {orgName || slug}
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="text-center max-w-md space-y-8">
                    {/* Icon */}
                    <div className="relative inline-flex">
                        <div className="w-24 h-24 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-violet-400" />
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
                                <span className="text-violet-400 mt-0.5">1.</span>
                                <span>Nosso sistema está verificando o pagamento junto ao Stripe.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5">2.</span>
                                <span>Após confirmação, o cargo/acesso será entregue automaticamente no Discord.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5">3.</span>
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
                            href={`/s/${slug}/store`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all"
                        >
                            <ExternalLink size={14} />
                            Voltar à loja
                        </Link>
                        <Link
                            href={`/s/${slug}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-bold text-sm transition-all border border-white/10"
                        >
                            Ir para a comunidade
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/5">
                <div className="max-w-2xl mx-auto px-6 py-5 text-xs text-white/20 text-center">
                    Powered by <a href="https://orbitup.io" className="text-violet-400 hover:underline">OrbitOS</a>
                </div>
            </footer>
        </div>
    );
}
