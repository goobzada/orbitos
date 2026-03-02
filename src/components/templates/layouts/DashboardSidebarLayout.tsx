import React, { useState } from 'react';
import { TemplateConfig, CommunityData } from '../types';
import { Ticket, ShoppingCart, UserPlus, Server, Home } from 'lucide-react';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

export function DashboardSidebarLayout({ config, community }: Props) {
    const [activeTab, setActiveTab] = useState('Início');

    const isNeon = config.backgroundPattern === 'grid-neon';
    const isCosmic = config.backgroundPattern === 'cosmos';
    const bgClass = isNeon || isCosmic ? 'bg-[#09090b] relative' : 'bg-background';

    // Estilo dos Cards (Tailwind 4 / Vars base)
    const cardBorder = isNeon
        ? 'border border-primary/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-md'
        : isCosmic
            ? 'border border-primary/20 bg-black/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'border border-border/50 shadow-sm';

    const cardRadius = isNeon ? 'rounded-md' : isCosmic ? 'rounded-[2rem]' : 'rounded-lg';

    const menuItems = [
        { name: 'Início', icon: Home },
        { name: 'Servidores', icon: Server },
        { name: 'Tickets', icon: Ticket },
        { name: 'Loja VIP', icon: ShoppingCart },
    ];

    return (
        <div className={`min-h-screen flex text-foreground ${bgClass} font-sans`}>
            {/* Ambient Background Layers */}
            {isNeon && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}
                />
            )}

            {isCosmic && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full animate-pulse delay-1000" />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3C%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                </div>
            )}

            {/* Sidebar */}
            <aside className={`w-64 border-r ${isNeon ? 'border-primary/20 bg-black/50' : isCosmic ? 'border-white/5 bg-black/20 text-white' : 'border-border bg-card/50'} backdrop-blur-md p-4 flex flex-col z-10`}>
                <div
                    onClick={() => setActiveTab('Início')}
                    className="flex items-center gap-3 mb-8 cursor-pointer group"
                >
                    {config.logoUrl ? (
                        <img
                            src={config.logoUrl}
                            alt={community.name}
                            style={{ height: (config.logoHeight || 40) + 'px' }}
                            className="object-contain"
                        />
                    ) : (
                        <>
                            <img src={community.avatar} alt={community.name} className="w-10 h-10 rounded-md object-cover ring-1 ring-white/10 group-hover:ring-primary/50 transition-all" />
                            <h1 className={`font-bold text-lg leading-tight transition-colors ${isNeon ? 'text-primary drop-shadow-[0_0_5px_var(--primary)]' : isCosmic ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50' : 'group-hover:text-primary'}`}>
                                {community.name}
                            </h1>
                        </>
                    )}
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all ${cardRadius} ${activeTab === item.name
                                ? 'bg-primary/20 text-primary font-semibold ring-1 ring-primary/30'
                                : isCosmic ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-4 py-3 border-t border-white/5 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                    {config.templateKey}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col z-10 overflow-hidden">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm">
                    <h2 className="text-xl font-bold tracking-tight opacity-90">{activeTab}</h2>
                    <div className="flex items-center gap-4">
                        {(isNeon || isCosmic) && (
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/80 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 shadow-inner">
                                <span className={`w-2 h-2 rounded-full bg-green-500 ${isCosmic ? 'shadow-[0_0_8px_#22c55e]' : 'animate-pulse'}`} /> Cluster Online
                            </div>
                        )}
                        <button className="text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full transition-all border border-white/10 hover:border-white/20">
                            Entrar
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'Início' && (
                        <>
                            {config.heroMode !== 'none' && (
                                <div
                                    className={`p-10 ${config.cardShape === 'rounded' ? 'rounded-2xl' : cardRadius} border border-white/5 relative overflow-hidden group min-h-[220px] flex items-center shadow-3xl`}
                                    style={{
                                        backgroundImage: 'var(--hero-url)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'var(--hero-pos, center)',
                                    }}
                                >
                                    {/* Hero Overlay */}
                                    <div
                                        className="absolute inset-0 bg-black/70 group-hover:bg-black/50 transition-all duration-700"
                                        style={{ opacity: 'var(--hero-opacity, 0.7)' }}
                                    />

                                    <div className="relative z-10">
                                        <h3 className="text-4xl font-black italic tracking-tighter mb-4 drop-shadow-2xl text-[var(--color-hero-text)] uppercase tracking-[-0.04em]">
                                            Bem-vindo à {community.name}
                                        </h3>
                                        <p className="text-white/60 max-w-xl text-sm font-medium drop-shadow-sm leading-relaxed uppercase tracking-wide italic">{community.description}</p>
                                        <div className="mt-8 flex gap-4">
                                            <button
                                                onClick={() => alert('Conectando ao Discord...')}
                                                className={`px-8 py-3 bg-primary text-primary-foreground font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all ${cardRadius}`}
                                            >
                                                Entrar no Discord
                                            </button>
                                            <button className={`px-8 py-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all text-white font-black uppercase text-[11px] tracking-widest border border-white/10 ${cardRadius}`}>
                                                Saber Mais
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cards 2 Cols */}
                            <div className={`grid gap-6 ${isNeon || isCosmic ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                {[
                                    { icon: Ticket, label: 'Tickets Abertos', value: '3' },
                                    { icon: Server, label: 'Latência', value: '45ms' },
                                    { icon: ShoppingCart, label: 'Itens na Loja', value: '12' },
                                    { icon: UserPlus, label: 'Novos Membros', value: '+40' },
                                ].slice(0, isNeon || isCosmic ? 3 : 4).map((stat, i) => (
                                    <div key={i} className={`bg-card/20 p-8 ${cardRadius} ${cardBorder} flex items-center gap-6 hover:bg-card/40 transition-all hover:-translate-y-2 cursor-pointer group`}>
                                        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${isNeon ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'bg-primary/10 text-primary'}`}>
                                            <stat.icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50 mb-1 leading-none">{stat.label}</p>
                                            <p className={`text-4xl font-black italic tracking-tighter ${isNeon ? 'drop-shadow-[0_0_5px_rgba(var(--primary),0.5)] text-primary' : isCosmic ? 'text-white' : ''}`}>{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={`w-full h-80 bg-card/20 ${cardRadius} ${cardBorder} flex flex-col items-center justify-center border-dashed border-2 opacity-40 group hover:opacity-100 transition-opacity duration-500 overflow-hidden relative`}>
                                {isCosmic && (
                                    <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-secondary to-primary animate-[spin_10s_linear_infinite]" />
                                    </div>
                                )}
                                <div className="text-center z-10">
                                    <Home className="w-16 h-16 mx-auto mb-4 opacity-20 group-hover:scale-110 group-hover:text-primary transition-all duration-500" />
                                    <span className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] block italic">Inertia Feed Active</span>
                                    <span className="text-white/20 text-[9px] uppercase mt-2 block">Awaiting incoming community events...</span>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab !== 'Início' && (
                        <div className="flex flex-col items-center justify-center h-full opacity-60 py-20">
                            <div className={`p-12 rounded-[3rem] ${isCosmic ? 'bg-primary/10 border border-primary/20 rotate-3 animate-pulse' : 'bg-primary/5'} mb-8 shadow-2xl`}>
                                {activeTab === 'Loja VIP' && <ShoppingCart className={`w-28 h-28 ${isCosmic ? 'text-white' : 'text-primary'}`} />}
                                {activeTab === 'Tickets' && <Ticket className={`w-28 h-28 ${isCosmic ? 'text-white' : 'text-primary'}`} />}
                                {activeTab === 'Servidores' && <Server className={`w-28 h-28 ${isCosmic ? 'text-white' : 'text-primary'}`} />}
                            </div>
                            <h3 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">{activeTab}</h3>
                            <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest max-w-sm text-center leading-loose">
                                O núcleo do sistema está sincronizando os dados em tempo real para a comunidade <span className="text-primary font-bold">{community.name}</span>.
                            </p>
                            <button
                                onClick={() => alert(`Acessando ${activeTab}...`)}
                                className={`mt-10 px-10 py-4 ${isCosmic ? 'bg-white text-black' : 'bg-primary/20 text-primary'} font-black uppercase tracking-widest text-xs rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl`}
                            >
                                Iniciar Protocolo
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
