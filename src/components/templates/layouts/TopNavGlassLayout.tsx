import React, { useState } from 'react';
import { TemplateConfig, CommunityData } from '../types';
import { Layout, Star, Ticket, Users } from 'lucide-react';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

export function TopNavGlassLayout({ config, community }: Props) {
    const [activeTab, setActiveTab] = useState('Painel');

    // Vidro fosco e top nav
    const glassClass = 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-foreground';

    const menuItems = [
        { name: 'Painel', icon: Layout },
        { name: 'Loja VIP', icon: Star },
        { name: 'Tickets', icon: Ticket },
        { name: 'Comunidade', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-black text-slate-200 font-sans flex flex-col items-center">
            {/* Background Soft Gradient */}
            <div className="fixed inset-0 pointer-events-none opacity-30" style={{
                background: 'radial-gradient(circle at 50% -20%, var(--primary) 0%, transparent 60%)'
            }} />

            {/* Top Nav */}
            <nav className={`w-full max-w-5xl mt-6 px-6 py-4 rounded-full flex items-center justify-between ${glassClass} z-50`}>
                <div className="flex items-center gap-3">
                    {config.logoUrl ? (
                        <img
                            src={config.logoUrl}
                            alt={community.name}
                            style={{ height: (config.logoHeight || 32) + 'px' }}
                            className="object-contain"
                        />
                    ) : (
                        <>
                            <img src={community.avatar} alt="Logo" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
                            <span className="font-semibold text-white tracking-wide">{community.name}</span>
                        </>
                    )}
                </div>
                <div className="hidden md:flex gap-6 text-sm font-medium">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`transition-colors flex items-center gap-2 ${activeTab === item.name ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
                <div>
                    <button className="bg-primary hover:bg-primary/80 text-white text-sm px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-primary/20">
                        Conectar
                    </button>
                </div>
            </nav>

            <main className="w-full max-w-5xl mt-20 flex-1 flex flex-col gap-12 px-6 pb-20 z-10">
                {activeTab === 'Painel' ? (
                    <>
                        {/* Hero */}
                        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
                            <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight">
                                Bem-vindo à {community.name}
                            </h1>
                            <p className="text-lg text-slate-400 leading-relaxed font-light">
                                {community.description}
                            </p>
                            <div className="pt-4 flex gap-8">
                                <div className={`px-6 py-4 rounded-3xl ${glassClass} flex flex-col gap-1 w-40 items-center`}>
                                    <span className="text-3xl font-bold text-white">12k+</span>
                                    <span className="text-xs uppercase tracking-wider text-slate-400">Membros</span>
                                </div>
                                <div className={`px-6 py-4 rounded-3xl ${glassClass} flex flex-col gap-1 w-40 items-center`}>
                                    <span className="text-3xl font-bold text-white">4.9</span>
                                    <span className="text-xs uppercase tracking-wider text-slate-400">Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Rows */}
                        <div className="grid grid-cols-2 gap-8 mt-10">
                            <button className={`h-80 rounded-[40px] p-8 flex flex-col justify-end text-left ${glassClass} group hover:bg-white/10 transition-all hover:scale-[1.02]`}>
                                <h3 className="text-2xl font-bold text-white mb-2">Acessar Loja VIP</h3>
                                <p className="text-slate-400 font-light">Desbloqueie benefícios e cargos exclusivos para os membros.</p>
                            </button>
                            <button className={`h-80 rounded-[40px] p-8 flex flex-col justify-end text-left ${glassClass} group hover:bg-white/10 transition-all hover:scale-[1.02]`}>
                                <h3 className="text-2xl font-bold text-white mb-2">Suporte & Tickets</h3>
                                <p className="text-slate-400 font-light">Acesse nosso time de suporte especializado via formulário.</p>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className={`p-12 rounded-full ${glassClass} mb-8`}>
                            {activeTab === 'Loja VIP' && <Star className="w-24 h-24 text-primary" />}
                            {activeTab === 'Tickets' && <Ticket className="w-24 h-24 text-primary" />}
                            {activeTab === 'Comunidade' && <Users className="w-24 h-24 text-primary" />}
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">{activeTab}</h2>
                        <p className="text-slate-400 max-w-md">Módulo de {activeTab.toLowerCase()} está sendo sincronizado com os serviços da {community.name}.</p>
                        <button className="mt-8 px-8 py-3 bg-white/10 border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all">
                            Carregar Conteúdo
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
