'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export default function StoreCancelPage() {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
            <header className="border-b border-white/5 bg-[#0d0d18]">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href={`/s/${slug}/store`}
                        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Voltar à loja
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
                            Nenhuma cobrança foi realizada. Você pode retornar à loja e tentar novamente quando quiser.
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={`/s/${slug}/store`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all"
                        >
                            <RotateCcw size={14} />
                            Tentar novamente
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
