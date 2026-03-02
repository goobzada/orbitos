import React, { useState } from 'react';
import { TemplateConfig, CommunityData } from '../types';
import { Component, Grid, ArrowRight, Activity, Wallet, Inbox, Sparkles, Layout } from 'lucide-react';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

export function BlocksLayout({ config, community }: Props) {
    const [activeTab, setActiveTab] = useState('Home');

    // Cores adaptativas do bloco Notion-like
    const blockBg = 'bg-white border border-slate-200 shadow-sm rounded-2xl';
    const textDark = 'text-slate-900';
    const textMuted = 'text-slate-500';

    const menuItems = [
        { name: 'Home', icon: Layout },
        { name: 'Tickets', icon: Inbox },
        { name: 'Allowlist', icon: Activity },
        { name: 'Loja', icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex overflow-hidden">

            {/* Sidebar Enxuta */}
            <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col h-screen fixed hidden md:flex z-10">
                <div
                    onClick={() => setActiveTab('Home')}
                    className="flex items-center gap-3 mb-8 hover:bg-slate-100 p-2 rounded-lg cursor-pointer transition-colors"
                >
                    {config.logoUrl ? (
                        <img
                            src={config.logoUrl}
                            alt={community.name}
                            style={{ height: (config.logoHeight || 32) + 'px' }}
                            className="object-contain"
                        />
                    ) : (
                        <>
                            <img src={community.avatar} alt="Logo" className="w-8 h-8 rounded-md shrink-0 shadow-sm object-cover" />
                            <div className="truncate">
                                <h1 className={`font-semibold text-sm ${textDark} truncate`}>{community.name}</h1>
                                <span className="text-xs text-slate-500">Comunidade Ativa</span>
                            </div>
                        </>
                    )}
                </div>

                <nav className="flex-1 space-y-1">
                    <SectionTitle>Módulos Ativos</SectionTitle>
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full text-left px-3 py-1.5 transition-colors rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === item.name ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === item.name ? 'text-indigo-500' : 'text-slate-400'}`} />
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-3 py-2 text-xs text-slate-400 border-t border-slate-100 pt-4">
                    Gerenciado por {community.name}
                </div>
            </aside>

            {/* Área Principal (Mosaico de Grid) */}
            <main className="flex-1 md:ml-64 flex flex-col p-8 overflow-y-auto">
                <header className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                        <Grid className="w-6 h-6 text-slate-400" /> {activeTab}
                    </h2>
                    <button
                        onClick={() => alert('Opção disponível apenas para Administradores.')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                    >
                        Configurar Portal
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                    {activeTab === 'Home' ? (
                        <>
                            {/* Welcome Block (Col-span 2) */}
                            <div className={`${blockBg} col-span-1 md:col-span-2 p-8 flex flex-col justify-between hover:border-indigo-200 transition-all`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-semibold">Portal Público</span>
                                        <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-semibold">Sincronizado</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Bem-vindo à {community.name}</h3>
                                    <p className="text-slate-500 leading-relaxed max-w-2xl">{community.description}</p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                                    <button
                                        onClick={() => setActiveTab('Loja')}
                                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
                                    >
                                        Explorar Loja VIP <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Metrics Block */}
                            <div className={`${blockBg} p-8 flex flex-col justify-between hover:border-blue-200 transition-colors bg-gradient-to-br from-white to-blue-50/50`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-inner">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Membros Ativos</p>
                                    <h4 className="text-5xl font-black text-slate-900 tracking-tight">12.4K</h4>
                                </div>
                            </div>

                            {/* Module Block: Tickets */}
                            <div onClick={() => setActiveTab('Tickets')} className={`${blockBg} p-8 hover:shadow-lg transition-all group cursor-pointer hover:-translate-y-1`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                                        <Inbox className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-rose-500">URGENTE</span>
                                </div>
                                <h3 className="font-bold text-xl mb-2">Suporte & Chamados</h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">Abra um ticket para resolver problemas ou tirar dúvidas com nossa equipe.</p>
                                <div className="flex gap-2">
                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-center flex-1">3 Chamados</span>
                                </div>
                            </div>

                            {/* Module Block: Store */}
                            <div onClick={() => setActiveTab('Loja')} className={`${blockBg} p-8 hover:shadow-lg transition-all group cursor-pointer hover:-translate-y-1`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-xl mb-2">Loja de Itens VIP</h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">Adquira vantagens exclusivas e ajude a manter nossa comunidade online.</p>
                                <div className="flex gap-2">
                                    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-sm">Ver Catálogo</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-full py-32 flex flex-col items-center text-center">
                            <div className="bg-slate-200/50 p-10 rounded-full mb-8">
                                <Activity className="w-20 h-20 text-slate-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Módulo de {activeTab}</h2>
                            <p className="text-slate-500 max-w-lg mb-8">A integração completa com as funções do Discord está sincronizando os dados em tempo real. Por favor aguarde.</p>
                            <button className="px-10 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors">Voltar para Home</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-8 mb-4 px-3">{children}</div>;
}
