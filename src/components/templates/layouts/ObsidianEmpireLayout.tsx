'use client';

import React, { useState, useEffect } from 'react';
import { TemplateConfig, CommunityData } from '../types';
import { Ticket, ShoppingCart, Users, Crown, Shield, Zap, ChevronRight, Star } from 'lucide-react';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const GOLD_DIM = '#C9A84C44';

export function ObsidianEmpireLayout({ config, community }: Props) {
    const [activeSection, setActiveSection] = useState<'home' | 'store' | 'tickets' | 'community'>('home');
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setTick(n => n + 1), 1200);
        return () => clearInterval(t);
    }, []);

    // Produtos reais vindos do portal (community.modules = store products)
    const storeProducts = community.modules || [];

    const navItems = [
        { key: 'home', label: 'Império' },
        { key: 'store', label: 'Loja VIP' },
        { key: 'tickets', label: 'Suporte' },
        { key: 'community', label: 'Membros' },
    ] as const;

    const stats = [
        { label: 'Membros Elite', value: '4.200', icon: Crown },
        { label: 'Operações Ativas', value: '38', icon: Zap },
        { label: 'Itens na Loja', value: String(storeProducts.length || '—'), icon: ShoppingCart },
        { label: 'Tickets Resolvidos', value: '99%', icon: Shield },
    ];

    return (
        <div
            className="min-h-screen flex flex-col text-white overflow-x-hidden"
            style={{ background: '#050505', fontFamily: "'Georgia', serif" }}
        >
            {/* Subtle gold noise texture overlay */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(201,168,76,0.06) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            {/* ─── TOP NAVIGATION BAR ─── */}
            <header
                className="relative z-50 flex items-center justify-between px-10 py-0"
                style={{
                    borderBottom: `1px solid ${GOLD_DIM}`,
                    background: 'rgba(5,5,5,0.97)',
                    backdropFilter: 'blur(20px)',
                    height: '60px',
                }}
            >
                {/* Left: Logo + Name */}
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: 32, height: 32,
                            border: `1px solid ${GOLD}`,
                            background: 'rgba(201,168,76,0.08)',
                        }}
                    >
                        <Crown size={14} style={{ color: GOLD }} />
                    </div>
                    <span
                        className="text-sm font-bold uppercase tracking-[0.3em]"
                        style={{ color: GOLD, fontFamily: "'Georgia', serif", letterSpacing: '0.3em' }}
                    >
                        {community.name}
                    </span>
                </div>

                {/* Center: Nav */}
                <nav className="flex items-center gap-0">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key)}
                            className="relative px-6 py-5 text-[11px] font-bold uppercase tracking-[0.25em] transition-all"
                            style={{
                                color: activeSection === item.key ? GOLD : 'rgba(255,255,255,0.3)',
                                borderBottom: activeSection === item.key ? `2px solid ${GOLD}` : '2px solid transparent',
                                fontFamily: 'sans-serif',
                                letterSpacing: '0.25em',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Right: CTA */}
                <button
                    className="flex items-center gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105"
                    style={{
                        background: GOLD,
                        color: '#050505',
                        fontFamily: 'sans-serif',
                        letterSpacing: '0.2em',
                    }}
                >
                    <Crown size={11} />
                    Entrar
                </button>
            </header>

            {/* ─── MAIN CONTENT ─── */}
            <main className="relative flex-1 z-10">

                {activeSection === 'home' && (
                    <>
                        {/* ─── EDITORIAL HERO ─── */}
                        <section className="relative overflow-hidden" style={{ minHeight: 420 }}>
                            {/* Background image / overlay */}
                            {config.heroUrl && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `url(${config.heroUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: config.heroPosition || 'center',
                                        filter: 'brightness(0.25) saturate(0.4)',
                                    }}
                                />
                            )}

                            {/* Angled gold separator bottom */}
                            <div
                                className="absolute bottom-0 left-0 w-full h-24 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(to bottom, transparent, #050505)',
                                }}
                            />

                            <div className="relative z-10 flex flex-col justify-end h-full px-16 pt-20 pb-14">
                                {/* Eyebrow label */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div style={{ width: 40, height: 1, background: GOLD }} />
                                    <span
                                        className="text-[10px] font-black uppercase tracking-[0.5em]"
                                        style={{ color: GOLD, fontFamily: 'sans-serif' }}
                                    >
                                        Comunidade Elite
                                    </span>
                                </div>

                                {/* Headline */}
                                <h1
                                    className="text-[72px] font-black leading-[0.92] tracking-[-3px] mb-2 uppercase"
                                    style={{
                                        fontFamily: "'Georgia', serif",
                                        background: `linear-gradient(135deg, #fff 0%, ${GOLD_LIGHT} 50%, #fff 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {community.name}
                                </h1>

                                {/* Subheadline */}
                                <p
                                    className="text-[14px] max-w-lg leading-relaxed mb-10"
                                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', fontStyle: 'italic' }}
                                >
                                    {community.description}
                                </p>

                                {/* CTA Row */}
                                <div className="flex items-center gap-6">
                                    <button
                                        className="flex items-center gap-3 px-8 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all hover:brightness-110"
                                        style={{ background: GOLD, color: '#050505', letterSpacing: '0.2em', fontFamily: 'sans-serif' }}
                                    >
                                        <Crown size={13} />
                                        Entrar no Discord
                                    </button>
                                    <button
                                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all"
                                        style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', borderBottom: '1px solid rgba(255,255,255,0.15)' }}
                                    >
                                        Ver Loja VIP
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ─── GOLD DIVIDER ─── */}
                        <div className="px-16 py-6">
                            <div className="flex items-center gap-4">
                                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD_DIM})` }} />
                                <div style={{ width: 6, height: 6, background: GOLD, transform: 'rotate(45deg)' }} />
                                <span className="text-[9px] font-black uppercase tracking-[0.6em]" style={{ color: GOLD, fontFamily: 'sans-serif' }}>
                                    ⬥ EMPIRE STATS ⬥
                                </span>
                                <div style={{ width: 6, height: 6, background: GOLD, transform: 'rotate(45deg)' }} />
                                <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD_DIM})` }} />
                            </div>
                        </div>

                        {/* ─── STATS HORIZONTAL BAR ─── */}
                        <section className="px-16 mb-12">
                            <div
                                className="grid grid-cols-4"
                                style={{ borderTop: `1px solid ${GOLD_DIM}`, borderBottom: `1px solid ${GOLD_DIM}` }}
                            >
                                {stats.map((stat, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col items-center justify-center py-10 gap-2 transition-all hover:bg-white/[0.02]"
                                        style={{
                                            borderRight: i < 3 ? `1px solid ${GOLD_DIM}` : 'none',
                                        }}
                                    >
                                        <stat.icon size={16} style={{ color: GOLD, opacity: 0.7 }} />
                                        <span
                                            className="text-[48px] font-black leading-none"
                                            style={{
                                                fontFamily: "'Georgia', serif",
                                                color: 'white',
                                            }}
                                        >
                                            {stat.value}
                                        </span>
                                        <span
                                            className="text-[9px] font-bold uppercase tracking-[0.4em]"
                                            style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'sans-serif' }}
                                        >
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ─── TWO-COLUMN EDITORIAL GRID ─── */}
                        <section className="px-16 grid grid-cols-5 gap-10 mb-16">
                            {/* Large left card */}
                            <div
                                className="col-span-3 flex flex-col"
                                style={{ borderLeft: `2px solid ${GOLD}`, paddingLeft: 28 }}
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] mb-4" style={{ color: GOLD, fontFamily: 'sans-serif' }}>
                                    Destaques
                                </span>
                                <h2
                                    className="text-[36px] font-black leading-tight mb-6 uppercase"
                                    style={{ fontFamily: "'Georgia', serif" }}
                                >
                                    Bem-vindo ao<br />
                                    <span style={{ color: GOLD }}>Topo da Hierarquia</span>
                                </h2>
                                <p
                                    className="text-[13px] leading-relaxed mb-8"
                                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', fontStyle: 'italic' }}
                                >
                                    O Obsidian Empire é para aqueles que elevaram padrões além do comum.
                                    Aqui cada cargo, cada cargo e cada benefício foi pensado para uma
                                    experiência absolutamente superior.
                                </p>
                                <div className="flex gap-4">
                                    {['Elite Access', 'VIP Lounge', 'Empire Events'].map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                                            style={{
                                                border: `1px solid ${GOLD_DIM}`,
                                                color: GOLD,
                                                fontFamily: 'sans-serif',
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right side stacked items */}
                            <div className="col-span-2 flex flex-col gap-4">
                                {[
                                    { title: 'Canais Exclusivos', desc: 'Acesso a salas VIP bloqueadas para membros comuns.' },
                                    { title: 'Suporte Prioritário', desc: 'Tickets respondidos em menos de 2 horas.' },
                                    { title: 'Drops Mensais', desc: 'Benefícios exclusivos todo mês para membros Empire.' },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="p-5 transition-all hover:bg-white/[0.03] group cursor-pointer"
                                        style={{
                                            background: 'rgba(201,168,76,0.03)',
                                            border: `1px solid ${GOLD_DIM}`,
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: GOLD, fontFamily: 'sans-serif' }}>
                                                {String(i + 1).padStart(2, '0')} — {item.title}
                                            </span>
                                            <ChevronRight size={12} style={{ color: GOLD, opacity: 0.5 }} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif' }}>
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ─── BOTTOM MARQUEE ─── */}
                        <footer
                            className="py-4 overflow-hidden"
                            style={{ borderTop: `1px solid ${GOLD_DIM}`, background: 'rgba(201,168,76,0.02)' }}
                        >
                            <div
                                className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.5em]"
                                style={{
                                    color: 'rgba(201,168,76,0.3)',
                                    fontFamily: 'sans-serif',
                                    animation: 'empire-scroll 20s linear infinite',
                                }}
                            >
                                ⬥ OBSIDIAN EMPIRE ⬥ ELITE COMMUNITY ⬥ VIP ACCESS ⬥ DISCORD NETWORK ⬥ POWER VIBES ⬥ EMPIRE TIER ⬥ OBSIDIAN EMPIRE ⬥ ELITE COMMUNITY ⬥ VIP ACCESS ⬥ DISCORD NETWORK ⬥ POWER VIBES ⬥ EMPIRE TIER ⬥
                            </div>
                        </footer>
                    </>
                )}

                {activeSection === 'store' && (
                    <section className="px-16 py-12">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div style={{ width: 40, height: 1, background: GOLD }} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: GOLD, fontFamily: 'sans-serif' }}>
                                        VIP Store
                                    </span>
                                </div>
                                <h2 className="text-[42px] font-black uppercase leading-none" style={{ fontFamily: "'Georgia', serif" }}>
                                    Loja <span style={{ color: GOLD }}>Exclusiva</span>
                                </h2>
                            </div>
                        </div>

                        {storeProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ border: `1px solid ${GOLD_DIM}` }}>
                                <ShoppingCart size={40} style={{ color: GOLD, opacity: 0.3 }} />
                                <p className="text-sm uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif' }}>Nenhum produto disponível</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-6">
                                {storeProducts.map((p: any, i: number) => {
                                    const price = p.priceCents ? `R$ ${(p.priceCents / 100).toFixed(2).replace('.', ',')}` : '—';
                                    const slug = window.location.pathname.split('/')[2];
                                    return (
                                        <div
                                            key={p.id || i}
                                            className="group cursor-pointer transition-all hover:-translate-y-1"
                                            style={{ border: `1px solid ${GOLD_DIM}`, background: 'rgba(201,168,76,0.02)' }}
                                        >
                                            <div
                                                className="h-48 flex items-center justify-center overflow-hidden"
                                                style={{ background: `linear-gradient(135deg, rgba(201,168,76,0.1), rgba(5,5,5,0.8))`, borderBottom: `1px solid ${GOLD_DIM}` }}
                                            >
                                                {p.thumbnailUrl
                                                    ? <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                                                    : <Crown size={40} style={{ color: GOLD, opacity: 0.5 }} />
                                                }
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: GOLD, fontFamily: 'sans-serif' }}>
                                                        {p.category || 'VIP'}
                                                    </span>
                                                    <Star size={10} style={{ color: GOLD }} />
                                                </div>
                                                <h3 className="text-lg font-black uppercase tracking-wider mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                                                    {p.name}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-black" style={{ color: GOLD }}>
                                                        {price}
                                                    </span>
                                                    <a
                                                        href={`/s/${slug}/store`}
                                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all group-hover:bg-amber-500 inline-block"
                                                        style={{ background: GOLD, color: '#050505', fontFamily: 'sans-serif' }}
                                                    >
                                                        Comprar
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {(activeSection === 'tickets' || activeSection === 'community') && (
                    <section className="px-16 py-16 flex flex-col items-center text-center">
                        <div style={{ width: 80, height: 80, border: `1px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            {activeSection === 'tickets'
                                ? <Ticket size={32} style={{ color: GOLD, opacity: 0.6 }} />
                                : <Users size={32} style={{ color: GOLD, opacity: 0.6 }} />
                            }
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] mb-4" style={{ color: GOLD, fontFamily: 'sans-serif' }}>
                            {activeSection === 'tickets' ? 'Suporte Elite' : 'Hierarquia'}
                        </span>
                        <h2 className="text-[40px] font-black uppercase leading-none mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                            {activeSection === 'tickets' ? 'Abrir Ticket' : 'Membros Empire'}
                        </h2>
                        <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                            Sincronizando dados do servidor <span style={{ color: GOLD }}>{community.name}</span> em tempo real.
                        </p>
                    </section>
                )}
            </main>

            <style>{`
                @keyframes empire-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
