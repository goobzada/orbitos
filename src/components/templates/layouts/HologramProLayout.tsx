'use client';

import React, { useState, useEffect } from 'react';
import { TemplateConfig, CommunityData } from '../types';
import { Ticket, ShoppingCart, Users, Activity, Wifi, Database, Shield, Cpu, Terminal, ChevronRight, Crosshair } from 'lucide-react';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

const CYAN = '#00F5FF';
const CYAN_DIM = 'rgba(0,245,255,0.15)';
const CYAN_FAINT = 'rgba(0,245,255,0.06)';
const BG = '#01040D';
const SURFACE = '#030C1A';

export function HologramProLayout({ config, community }: Props) {
    const [activeTab, setActiveTab] = useState<'painel' | 'store' | 'tickets' | 'comunidade'>('painel');
    const [time, setTime] = useState('');
    const [scanLine, setScanLine] = useState(0);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setScanLine(n => (n + 1) % 100), 40);
        return () => clearInterval(t);
    }, []);

    const navItems = [
        { key: 'painel', label: 'PAINEL', code: 'P01' },
        { key: 'store', label: 'LOJA', code: 'S02' },
        { key: 'tickets', label: 'TICKETS', code: 'T03' },
        { key: 'comunidade', label: 'REDE', code: 'C04' },
    ] as const;

    const metrics = [
        { label: 'PING', value: '12ms', status: 'online' },
        { label: 'UPTIME', value: '99.9%', status: 'online' },
        { label: 'MEMBROS', value: '4,218', status: 'online' },
        { label: 'TICKETS', value: '3 abertos', status: 'warn' },
        { label: 'SERVIDOR', value: 'BR-01', status: 'online' },
        { label: 'CACHE', value: 'ATIVO', status: 'online' },
    ];

    const products = [
        { id: 'VIP-001', name: 'Rank Hologram', price: 'R$49', tier: 'TIER-1', shield: 'A' },
        { id: 'VIP-002', name: 'Rank Ghost', price: 'R$89', tier: 'TIER-2', shield: 'B' },
        { id: 'VIP-003', name: 'Rank Phantom', price: 'R$149', tier: 'TIER-3', shield: 'S' },
    ];

    const statusColor = (s: string) => s === 'warn' ? '#F5A623' : CYAN;

    return (
        <div
            className="min-h-screen flex flex-col overflow-hidden"
            style={{
                background: BG,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                position: 'relative',
            }}
        >
            {/* ─── ANIMATED SCAN LINE ─── */}
            <div
                className="fixed pointer-events-none z-50"
                style={{
                    left: 0, right: 0,
                    top: `${scanLine}%`,
                    height: 120,
                    background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.03), transparent)',
                    transition: 'top 40ms linear',
                }}
            />

            {/* ─── GRID BACKGROUND ─── */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    zIndex: 0,
                }}
            />

            {/* ─── CORNER GLOW ─── */}
            <div
                className="fixed pointer-events-none"
                style={{
                    top: -200, left: -200,
                    width: 600, height: 600,
                    background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)',
                    zIndex: 0,
                }}
            />
            <div
                className="fixed pointer-events-none"
                style={{
                    bottom: -200, right: -200,
                    width: 600, height: 600,
                    background: 'radial-gradient(circle, rgba(0,100,200,0.08) 0%, transparent 70%)',
                    zIndex: 0,
                }}
            />

            {/* ─── HUD TOP BAR ─── */}
            <header
                className="relative z-40 flex items-center justify-between px-6"
                style={{
                    height: 52,
                    background: SURFACE,
                    borderBottom: `1px solid ${CYAN_DIM}`,
                    boxShadow: `0 0 20px rgba(0,245,255,0.05)`,
                }}
            >
                {/* Left: logo + target reticle */}
                <div className="flex items-center gap-4">
                    <div
                        style={{
                            animation: 'spin 8s linear infinite',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Crosshair size={16} style={{ color: CYAN }} />
                    </div>
                    <div
                        className="text-xs font-black uppercase tracking-[0.3em]"
                        style={{ color: CYAN, textShadow: `0 0 10px ${CYAN}` }}
                    >
                        {community.name}
                    </div>
                    <span className="text-[9px] opacity-30 uppercase tracking-widest">// HOLOGRAM-PRO</span>
                </div>

                {/* Center: nav tabs */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
                            style={{
                                border: `1px solid ${activeTab === item.key ? CYAN_DIM : 'transparent'}`,
                                background: activeTab === item.key ? CYAN_FAINT : 'transparent',
                                color: activeTab === item.key ? CYAN : 'rgba(255,255,255,0.3)',
                                boxShadow: activeTab === item.key ? `0 0 12px rgba(0,245,255,0.1)` : 'none',
                            }}
                        >
                            <span style={{ color: activeTab === item.key ? CYAN : 'rgba(255,255,255,0.15)', fontSize: 8 }}>
                                [{item.code}]
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Right: system info */}
                <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Wifi size={10} style={{ color: CYAN }} />
                        <span style={{ color: CYAN, textShadow: `0 0 6px ${CYAN}` }}>ONLINE</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>{time}</span>
                    <button
                        className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                        style={{
                            border: `1px solid ${CYAN}`,
                            color: CYAN,
                            boxShadow: `0 0 10px rgba(0,245,255,0.2)`,
                        }}
                    >
                        ENTRAR
                    </button>
                </div>
            </header>

            {/* ─── MAIN LAYOUT: Left content + Right panel ─── */}
            <div className="relative z-10 flex flex-1 overflow-hidden">

                {/* ─── LEFT MAIN CONTENT ─── */}
                <main className="flex-1 overflow-y-auto">
                    {activeTab === 'painel' && (
                        <div className="p-8 space-y-6">
                            {/* Hero HUD panel */}
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    background: SURFACE,
                                    border: `1px solid ${CYAN_DIM}`,
                                    padding: '36px 40px',
                                    boxShadow: `inset 0 0 40px rgba(0,245,255,0.03)`,
                                }}
                            >
                                {/* Corner brackets */}
                                {[
                                    { top: 8, left: 8, transform: 'none' },
                                    { top: 8, right: 8, transform: 'scaleX(-1)' },
                                    { bottom: 8, left: 8, transform: 'scaleY(-1)' },
                                    { bottom: 8, right: 8, transform: 'scale(-1)' },
                                ].map((pos, i) => (
                                    <div
                                        key={i}
                                        className="absolute pointer-events-none"
                                        style={{
                                            ...pos,
                                            width: 16, height: 16,
                                            borderTop: `2px solid ${CYAN}`,
                                            borderLeft: `2px solid ${CYAN}`,
                                            opacity: 0.6,
                                        }}
                                    />
                                ))}

                                <div className="flex items-center gap-3 mb-4">
                                    <Activity size={12} style={{ color: CYAN }} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: CYAN }}>
                                        // SISTEMA ATIVO — {community.name}
                                    </span>
                                </div>

                                <h1
                                    className="text-[52px] font-black leading-none mb-3 uppercase"
                                    style={{
                                        letterSpacing: '-2px',
                                        color: 'white',
                                        textShadow: `0 0 30px rgba(0,245,255,0.2)`,
                                    }}
                                >
                                    BEM-VINDO À<br />
                                    <span style={{ color: CYAN, textShadow: `0 0 20px ${CYAN}` }}>
                                        {community.name}
                                    </span>
                                </h1>

                                <p className="text-[12px] leading-relaxed max-w-lg mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                    {community.description}
                                </p>

                                <div className="flex items-center gap-4">
                                    <button
                                        className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                                        style={{
                                            background: CYAN,
                                            color: BG,
                                            boxShadow: `0 0 20px rgba(0,245,255,0.4)`,
                                        }}
                                    >
                                        <Terminal size={11} />
                                        CONECTAR
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all"
                                        style={{
                                            border: `1px solid ${CYAN_DIM}`,
                                            color: 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        SAIBA MAIS
                                        <ChevronRight size={11} />
                                    </button>
                                </div>
                            </div>

                            {/* 4-stat grid */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { icon: Users, label: 'MEMBROS ATIVOS', value: '4,218', delta: '+12%' },
                                    { icon: ShoppingCart, label: 'ITENS NA LOJA', value: '127', delta: '+5' },
                                    { icon: Ticket, label: 'TICKETS ABERTOS', value: '3', delta: '-2' },
                                    { icon: Shield, label: 'UPTIME', value: '99.9%', delta: '30d' },
                                ].map((stat, i) => (
                                    <div
                                        key={i}
                                        className="p-5 transition-all hover:bg-white/[0.02] group"
                                        style={{
                                            background: SURFACE,
                                            border: `1px solid ${CYAN_DIM}`,
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <stat.icon size={14} style={{ color: CYAN, opacity: 0.7 }} />
                                            <span className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                                {stat.delta}
                                            </span>
                                        </div>
                                        <div className="text-[32px] font-black leading-none mb-2" style={{ color: 'white' }}>
                                            {stat.value}
                                        </div>
                                        <div className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(0,245,255,0.4)' }}>
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Activity feed */}
                            <div
                                style={{
                                    background: SURFACE,
                                    border: `1px solid ${CYAN_DIM}`,
                                    padding: '20px 24px',
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Database size={11} style={{ color: CYAN }} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: CYAN }}>
                                        STREAM DE EVENTOS
                                    </span>
                                    <div className="flex-1 h-px ml-4" style={{ background: CYAN_DIM }} />
                                </div>
                                {[
                                    { type: 'JOIN', user: 'ghost_user_x', time: '2s' },
                                    { type: 'TICKET', user: 'matrix_dev', time: '14s' },
                                    { type: 'BUY', user: 'phantom_sys', time: '1m' },
                                    { type: 'JOIN', user: 'neon_citizen', time: '3m' },
                                    { type: 'ROLE', user: 'echo_runner', time: '5m' },
                                ].map((ev, i) => (
                                    <div key={i} className="flex items-center gap-4 py-2" style={{ borderBottom: `1px solid rgba(0,245,255,0.04)` }}>
                                        <span
                                            className="text-[8px] font-black px-2 py-0.5 min-w-[42px] text-center"
                                            style={{
                                                background: ev.type === 'JOIN' ? 'rgba(0,245,255,0.1)' : ev.type === 'BUY' ? 'rgba(0,200,100,0.1)' : 'rgba(255,200,0,0.1)',
                                                color: ev.type === 'JOIN' ? CYAN : ev.type === 'BUY' ? '#00C864' : '#F5C800',
                                                border: `1px solid ${ev.type === 'JOIN' ? CYAN_DIM : ev.type === 'BUY' ? 'rgba(0,200,100,0.2)' : 'rgba(255,200,0,0.2)'}`,
                                            }}
                                        >
                                            {ev.type}
                                        </span>
                                        <span className="flex-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {ev.user}
                                        </span>
                                        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                            {ev.time} atrás
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'store' && (
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <ShoppingCart size={14} style={{ color: CYAN }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: CYAN }}>
                                    // LOJA VIP — RANKING SYSTEM
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {products.map((p, i) => (
                                    <div
                                        key={i}
                                        className="group cursor-pointer transition-all hover:-translate-y-1"
                                        style={{
                                            background: SURFACE,
                                            border: `1px solid ${CYAN_DIM}`,
                                            boxShadow: `0 0 0 rgba(0,245,255,0)`,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <div
                                            className="h-40 flex flex-col items-center justify-center gap-2"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,0,0,0))',
                                                borderBottom: `1px solid ${CYAN_DIM}`,
                                            }}
                                        >
                                            <div
                                                className="text-[32px] font-black"
                                                style={{
                                                    color: CYAN,
                                                    textShadow: `0 0 20px ${CYAN}`,
                                                    fontFamily: 'monospace',
                                                }}
                                            >
                                                [{p.shield}]
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: 'rgba(0,245,255,0.4)' }}>
                                                {p.tier}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <div className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                                ID: {p.id}
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'white' }}>
                                                {p.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-black" style={{ color: CYAN }}>
                                                    {p.price}
                                                </span>
                                                <button
                                                    className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest"
                                                    style={{
                                                        background: 'rgba(0,245,255,0.1)',
                                                        border: `1px solid ${CYAN_DIM}`,
                                                        color: CYAN,
                                                    }}
                                                >
                                                    ADQUIRIR
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'tickets' || activeTab === 'comunidade') && (
                        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div
                                className="mb-6"
                                style={{
                                    width: 72, height: 72,
                                    border: `1px solid ${CYAN_DIM}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: CYAN_FAINT,
                                }}
                            >
                                {activeTab === 'tickets'
                                    ? <Ticket size={28} style={{ color: CYAN }} />
                                    : <Users size={28} style={{ color: CYAN }} />}
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[0.5em] mb-4" style={{ color: CYAN }}>
                                // {activeTab === 'tickets' ? 'SUPPORT SYSTEM' : 'NETWORK NODES'}
                            </div>
                            <h2 className="text-[36px] font-black uppercase mb-3" style={{ letterSpacing: '-1px', color: 'white' }}>
                                {activeTab === 'tickets' ? 'ABRIR TICKET' : 'MEMBROS DA REDE'}
                            </h2>
                            <p className="text-[11px] max-w-sm" style={{ color: 'rgba(255,255,255,0.3)', lineHeight: 1.8 }}>
                                SINCRONIZANDO DADOS DO NÓ{' '}
                                <span style={{ color: CYAN }}>{community.name.toUpperCase()}</span>{' '}
                                EM TEMPO REAL...
                            </p>
                        </div>
                    )}
                </main>

                {/* ─── RIGHT DATA PANEL ─── */}
                <aside
                    className="flex-shrink-0 overflow-y-auto"
                    style={{
                        width: 220,
                        background: SURFACE,
                        borderLeft: `1px solid ${CYAN_DIM}`,
                        padding: '20px 16px',
                    }}
                >
                    <div className="text-[8px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: 'rgba(0,245,255,0.4)' }}>
                        // SYSTEM STATUS
                    </div>

                    {metrics.map((m, i) => (
                        <div
                            key={i}
                            className="py-3"
                            style={{ borderBottom: `1px solid rgba(0,245,255,0.05)` }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                    {m.label}
                                </span>
                                <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                        background: statusColor(m.status),
                                        boxShadow: `0 0 4px ${statusColor(m.status)}`,
                                    }}
                                />
                            </div>
                            <div className="text-[13px] font-black" style={{ color: statusColor(m.status) }}>
                                {m.value}
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${CYAN_DIM}` }}>
                        <div className="text-[8px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: 'rgba(0,245,255,0.4)' }}>
                            // CPU LOAD
                        </div>
                        <div
                            className="h-1.5 w-full overflow-hidden mb-1"
                            style={{ background: 'rgba(0,245,255,0.08)' }}
                        >
                            <div
                                className="h-full"
                                style={{
                                    width: '23%',
                                    background: CYAN,
                                    boxShadow: `0 0 8px ${CYAN}`,
                                }}
                            />
                        </div>
                        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>23% — BR-CLUSTER-01</span>
                    </div>

                    <div className="mt-5">
                        <div className="text-[8px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: 'rgba(0,245,255,0.4)' }}>
                            // MEMÓRIA
                        </div>
                        <div
                            className="h-1.5 w-full overflow-hidden mb-1"
                            style={{ background: 'rgba(0,245,255,0.08)' }}
                        >
                            <div
                                className="h-full"
                                style={{
                                    width: '67%',
                                    background: '#F5A623',
                                    boxShadow: '0 0 8px #F5A623',
                                }}
                            />
                        </div>
                        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>67% — 4.2 / 6.4 GB</span>
                    </div>

                    <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${CYAN_DIM}` }}>
                        <Cpu size={10} style={{ color: CYAN, display: 'block', marginBottom: 8 }} />
                        <div className="text-[8px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                            NODE: BR-01<br />
                            ENV: PRODUCTION<br />
                            BUILD: v2.4.1<br />
                            LAT: -23.55 +LON: -46.63
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
