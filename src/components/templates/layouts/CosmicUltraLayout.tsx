'use client';

import React, { useState, useEffect } from 'react';
import { TemplateConfig, CommunityData } from '../types';
import { Ticket, ShoppingCart, Users, Home, Sparkles, Orbit, Star, Zap, ChevronRight } from 'lucide-react';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

export function CosmicUltraLayout({ config, community }: Props) {
    const [activeTab, setActiveTab] = useState('Início');
    const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number; delay: number }>>([]);

    useEffect(() => {
        // Generate star field once on mount
        setStars(
            Array.from({ length: 80 }, (_, i) => ({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.6 + 0.2,
                delay: Math.random() * 4,
            }))
        );
    }, []);

    const navItems = [
        { name: 'Início', icon: Home },
        { name: 'Explorar', icon: Orbit },
        { name: 'Loja VIP', icon: ShoppingCart },
        { name: 'Tickets', icon: Ticket },
    ];

    const stats = [
        { icon: Users, label: 'Membros no Cosmos', value: '4.2k', color: '#A78BFA' },
        { icon: Star, label: 'Eventos Estelares', value: '38', color: '#818CF8' },
        { icon: ShoppingCart, label: 'Relíquias na Loja', value: '127', color: '#C4B5FD' },
        { icon: Zap, label: 'Latência da Órbita', value: '12ms', color: '#7C3AED' },
    ];

    return (
        <div
            className="min-h-screen flex overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #050010 0%, #0A0020 30%, #050015 60%, #020008 100%)',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: "'Inter', 'system-ui', sans-serif",
                position: 'relative',
            }}
        >
            {/* ─── STAR FIELD ─── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                            background: 'white',
                            opacity: star.opacity,
                            animation: `cosmic-twinkle ${2 + star.delay}s ease-in-out infinite alternate`,
                            boxShadow: star.size > 1.5 ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
                        }}
                    />
                ))}
            </div>

            {/* ─── NEBULA ORBS ─── */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute"
                    style={{
                        top: '-20%', left: '-15%',
                        width: '70%', height: '70%',
                        background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, rgba(109,40,217,0.08) 40%, transparent 70%)',
                        filter: 'blur(40px)',
                        animation: 'cosmic-nebula-1 12s ease-in-out infinite alternate',
                    }}
                />
                <div
                    className="absolute"
                    style={{
                        bottom: '-15%', right: '-10%',
                        width: '60%', height: '60%',
                        background: 'radial-gradient(ellipse, rgba(79,70,229,0.15) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'cosmic-nebula-2 16s ease-in-out infinite alternate',
                    }}
                />
                <div
                    className="absolute"
                    style={{
                        top: '30%', right: '20%',
                        width: '30%', height: '30%',
                        background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                        animation: 'cosmic-nebula-3 8s ease-in-out infinite alternate',
                    }}
                />
            </div>

            {/* ─── FLOATING GLASS SIDEBAR ─── */}
            <aside
                className="relative z-30 flex-shrink-0 flex flex-col m-5 mr-0"
                style={{
                    width: 220,
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                    padding: '24px 16px',
                }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div
                        className="mb-3"
                        style={{
                            width: 56, height: 56,
                            borderRadius: 18,
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(124,58,237,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                        }}
                    >
                        {community.avatar
                            ? <img src={community.avatar} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Sparkles size={22} style={{ color: '#A78BFA' }} />
                        }
                    </div>
                    <span
                        className="text-[11px] font-extrabold mt-1 leading-tight"
                        style={{
                            background: 'linear-gradient(135deg, #fff 0%, #A78BFA 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '0.01em',
                        }}
                    >
                        {community.name}
                    </span>
                    <div
                        className="mt-2 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest"
                        style={{
                            background: 'rgba(124,58,237,0.2)',
                            border: '1px solid rgba(124,58,237,0.3)',
                            borderRadius: 20,
                            color: '#A78BFA',
                        }}
                    >
                        COSMIC MAX
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold transition-all"
                            style={{
                                borderRadius: 12,
                                background: activeTab === item.name
                                    ? 'rgba(124,58,237,0.25)'
                                    : 'transparent',
                                border: activeTab === item.name
                                    ? '1px solid rgba(167,139,250,0.3)'
                                    : '1px solid transparent',
                                color: activeTab === item.name
                                    ? '#D8B4FE'
                                    : 'rgba(255,255,255,0.35)',
                                boxShadow: activeTab === item.name
                                    ? '0 0 12px rgba(124,58,237,0.2)'
                                    : 'none',
                            }}
                        >
                            <item.icon size={14} />
                            {item.name}
                        </button>
                    ))}
                </nav>

                {/* Bottom info */}
                <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div
                        className="flex items-center gap-2"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{
                                background: '#22C55E',
                                boxShadow: '0 0 6px #22C55E',
                                animation: 'cosmic-pulse 2s ease-in-out infinite',
                            }}
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Cluster Online
                        </span>
                    </div>
                </div>
            </aside>

            {/* ─── MAIN CONTENT ─── */}
            <main className="relative z-20 flex-1 overflow-y-auto p-6">

                {activeTab === 'Início' && (
                    <div className="space-y-6">
                        {/* Hero glass panel */}
                        <div
                            className="relative overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(40px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 24,
                                padding: '48px 48px 48px',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                                minHeight: 300,
                            }}
                        >
                            {/* Background image */}
                            {config.heroUrl && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `url(${config.heroUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: config.heroPosition || 'center',
                                        filter: 'brightness(0.15) blur(4px)',
                                        borderRadius: 'inherit',
                                    }}
                                />
                            )}

                            {/* Orb decoration inside card */}
                            <div
                                className="absolute pointer-events-none"
                                style={{
                                    top: -40, right: -40,
                                    width: 280, height: 280,
                                    background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
                                    filter: 'blur(20px)',
                                }}
                            />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-5">
                                    <Sparkles size={14} style={{ color: '#A78BFA' }} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.7)' }}>
                                        Portal Cósmico de {community.name}
                                    </span>
                                </div>

                                <h1
                                    className="text-[52px] font-black leading-[0.95] tracking-[-2px] mb-4"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #C4B5FD 50%, #818CF8 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Bem-vindo<br />
                                    ao Cosmos
                                </h1>

                                <p
                                    className="text-[13px] max-w-md leading-relaxed mb-8"
                                    style={{ color: 'rgba(255,255,255,0.4)' }}
                                >
                                    {community.description}
                                </p>

                                <div className="flex items-center gap-4">
                                    <button
                                        className="flex items-center gap-2 px-7 py-3 text-[12px] font-bold transition-all hover:scale-105"
                                        style={{
                                            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                                            borderRadius: 12,
                                            color: 'white',
                                            boxShadow: '0 0 30px rgba(124,58,237,0.5)',
                                        }}
                                    >
                                        <Sparkles size={13} />
                                        Entrar no Discord
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-7 py-3 text-[12px] font-semibold transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 12,
                                            color: 'rgba(255,255,255,0.6)',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        Saber Mais
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="group cursor-pointer transition-all hover:-translate-y-1"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        backdropFilter: 'blur(30px)',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: 20,
                                        padding: '24px 28px',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-5">
                                        <div
                                            style={{
                                                width: 36, height: 36,
                                                borderRadius: 12,
                                                background: `${stat.color}20`,
                                                border: `1px solid ${stat.color}40`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <stat.icon size={16} style={{ color: stat.color }} />
                                        </div>
                                        <span
                                            className="text-[10px] font-black uppercase tracking-[0.2em]"
                                            style={{ color: 'rgba(255,255,255,0.3)' }}
                                        >
                                            {stat.label}
                                        </span>
                                    </div>
                                    <div
                                        className="text-[40px] font-black leading-none"
                                        style={{
                                            background: `linear-gradient(135deg, #fff 0%, ${stat.color} 100%)`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* The Cosmos — ambient section */}
                        <div
                            style={{
                                background: 'rgba(124,58,237,0.06)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(124,58,237,0.15)',
                                borderRadius: 20,
                                padding: '32px',
                                boxShadow: '0 0 40px rgba(124,58,237,0.08)',
                                minHeight: 220,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)',
                                    animation: 'cosmic-nebula-1 6s ease-in-out infinite alternate',
                                }}
                            />
                            <Orbit size={48} style={{ color: 'rgba(167,139,250,0.3)', marginBottom: 16, position: 'relative' }} />
                            <span
                                className="text-[11px] font-black uppercase tracking-[0.4em] block mb-2"
                                style={{ color: 'rgba(167,139,250,0.5)', position: 'relative' }}
                            >
                                Galáxia de Eventos
                            </span>
                            <span
                                className="text-[10px] block"
                                style={{ color: 'rgba(255,255,255,0.2)', position: 'relative' }}
                            >
                                Sincronizando transmissões cósmicas da comunidade...
                            </span>
                        </div>
                    </div>
                )}

                {activeTab !== 'Início' && (
                    <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                        <div
                            className="mb-6"
                            style={{
                                width: 96, height: 96,
                                borderRadius: 28,
                                background: 'rgba(124,58,237,0.15)',
                                border: '1px solid rgba(167,139,250,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 40px rgba(124,58,237,0.25)',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            {activeTab === 'Loja VIP' && <ShoppingCart size={36} style={{ color: '#A78BFA' }} />}
                            {activeTab === 'Tickets' && <Ticket size={36} style={{ color: '#A78BFA' }} />}
                            {activeTab === 'Explorar' && <Orbit size={36} style={{ color: '#A78BFA' }} />}
                        </div>

                        <div
                            className="text-[9px] font-black uppercase tracking-[0.5em] mb-4"
                            style={{ color: 'rgba(167,139,250,0.5)' }}
                        >
                            Portal Cósmico
                        </div>

                        <h2
                            className="text-[42px] font-black leading-none mb-4"
                            style={{
                                background: 'linear-gradient(135deg, #fff 0%, #A78BFA 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-1px',
                            }}
                        >
                            {activeTab}
                        </h2>

                        <p className="text-[13px] max-w-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            O núcleo galáctico está sincronizando os dados em tempo real para{' '}
                            <span style={{ color: '#A78BFA' }}>{community.name}</span>.
                        </p>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes cosmic-twinkle {
                    from { opacity: var(--op, 0.3); transform: scale(1); }
                    to { opacity: calc(var(--op, 0.3) * 0.3); transform: scale(0.8); }
                }
                @keyframes cosmic-nebula-1 {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(3%, 2%) scale(1.05); }
                }
                @keyframes cosmic-nebula-2 {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(-2%, -3%) scale(1.08); }
                }
                @keyframes cosmic-nebula-3 {
                    from { transform: translate(0, 0); }
                    to { transform: translate(4%, -4%); }
                }
                @keyframes cosmic-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
