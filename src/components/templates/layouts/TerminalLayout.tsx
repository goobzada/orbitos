import React, { useState } from 'react';
import { TemplateConfig, CommunityData } from '../types';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

export function TerminalLayout({ config, community }: Props) {
    const [activeDir, setActiveDir] = useState('sys/events');
    const [activeTab, setActiveTab] = useState('/infra');

    // Cores fixas em estilo terminal
    const terminalGreen = 'text-[#00ff41] border-[#00ff41] focus:ring-[#00ff41]';
    const terminalBg = 'bg-[#0d0d0d]';

    return (
        <div className={`min-h-screen ${terminalBg} font-mono flex flex-col items-center selection:bg-[#00ff41] selection:text-black`}>
            {/* Scanlines Effect */}
            <div
                className="fixed inset-0 pointer-events-none opacity-5 mix-blend-overlay z-50"
                style={{
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 2px, 3px 100%'
                }}
            />

            {/* Header Hacker */}
            <header className={`w-full max-w-6xl p-6 border-b border-[#00ff41]/30 flex items-center justify-between ${terminalGreen} z-10`}>
                <div className="flex items-center gap-4">
                    <span
                        onClick={() => setActiveTab('/home')}
                        className="font-bold text-xl drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] cursor-pointer"
                    >
                        [ root@{community.name.toLowerCase().replace(/\s+/g, '-')} ]
                    </span>
                    <span className="text-xs opacity-50 hidden md:inline">sys.admin logged in</span>
                </div>

                <nav className="flex gap-6 uppercase text-sm font-bold tracking-widest">
                    {['/home', '/infra', '/logs'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`transition-colors px-2 ${activeTab === tab ? 'bg-[#00ff41] text-black' : 'hover:bg-[#00ff41] hover:text-black'}`}
                        >
                            {tab}
                        </button>
                    ))}
                    <button onClick={() => alert('Sessão encerrada.')} className="hover:text-red-500 hover:border-b hover:border-red-500 px-2 transition-colors text-red-500/80">/logout</button>
                </nav>
            </header>

            <main className="w-full max-w-6xl p-6 flex flex-1 overflow-hidden z-10 min-h-[500px]">

                {/* Sidebar Texto Puro */}
                <aside className="w-48 pr-6 flex flex-col gap-4 border-r border-[#00ff41]/20 h-full">
                    <div className="text-xs uppercase mb-4 opacity-50 tracking-wider">Directories</div>
                    <ul className="space-y-3 text-sm">
                        {['var/log/audit', 'etc/nginx', 'bin/automations', 'sys/events'].map(dir => (
                            <li
                                key={dir}
                                onClick={() => setActiveDir(dir)}
                                className={`cursor-pointer transition-all before:content-['>_'] before:mr-2 ${activeDir === dir ? 'text-white font-bold' : 'text-[#00ff41]/80 hover:text-white'}`}
                            >
                                {dir}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Console Central */}
                <div className="flex-1 flex flex-col pl-6">
                    <div className="border border-[#00ff41]/40 h-full bg-black/60 p-1 flex flex-col shadow-[0_0_20px_rgba(0,255,65,0.05)]">
                        <div className="bg-[#00ff41]/20 px-4 py-1.5 flex items-center justify-between border-b border-[#00ff41]/40">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 inline-block rounded-full" />
                                <span className="w-3 h-3 bg-yellow-500 inline-block rounded-full" />
                                <span className="w-3 h-3 bg-green-500 inline-block rounded-full" />
                                <span className="ml-4 text-[10px] font-black tracking-[0.2em] uppercase text-[#00ff41]/70">tty1 - {community.name}</span>
                            </div>
                            <span className="text-[10px] opacity-40 uppercase tracking-tighter">{activeDir}</span>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-[#00ff41]/90">
                            <p className="opacity-70 font-bold border-b border-[#00ff41]/10 pb-2">{community.name.toUpperCase().replace(/\s+/g, '_')}_CORE_v1.0.4 - Authentication Successful</p>
                            <div className="space-y-1">
                                <p className="opacity-70">Target: {community.name}</p>
                                <p className="opacity-70">Descriptor: {community.description}</p>
                            </div>

                            <div className="space-y-2 mt-8">
                                <p className="text-white/50 animate-pulse">// fetching metrics from {activeDir}...</p>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex gap-4 hover:bg-[#00ff41]/10 px-2 font-mono text-xs">
                                        <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                                        <span className={i % 4 === 0 ? 'text-red-400' : 'text-blue-400'}>
                                            {i % 4 === 0 ? 'FAIL' : 'OK'}
                                        </span>
                                        <span className="opacity-80">
                                            {i % 2 === 0 ? `Packet detected in ${activeDir}` : `Internal sync completed for Guild_${i}`}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 flex items-center bg-[#00ff41]/5 p-2 rounded">
                                <span className="text-[#00ff41] font-bold mr-2">root@{community.name.toLowerCase().replace(/\s+/g, '')}:/{activeDir}#</span>
                                <input
                                    className="bg-transparent border-none outline-none text-[#00ff41] flex-1 font-mono"
                                    autoFocus
                                    placeholder="type command..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            alert(`Command executed: ${e.currentTarget.value}`);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <span className="w-2 h-4 bg-[#00ff41] animate-pulse inline-block" />
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
