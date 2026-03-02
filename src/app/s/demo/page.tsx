'use client';

import React, { useState } from 'react';
import { CommunityPortal } from '@/components/templates/CommunityPortal';
import { TemplateConfig, CommunityData } from '@/components/templates/types';

// O Objeto Fake do Banco de Dados para a Comunidade do Demo
const mockCommunity: CommunityData = {
    name: "Galaxy Roleplay",
    description: "A maior cidade do FiveM. Servidor levado a sério com economia dinâmica e suporte excepcional. Faça parte !",
    avatar: "https://avatar.vercel.sh/galaxy",
    modules: []
};

// O Dicionário Oficial de V1 Templates mapeados a partir das tuas regras Core
const catalog: Record<string, TemplateConfig> = {
    "default-classic": {
        templateKey: "default-classic",
        layoutType: "dashboard-sidebar",
        heroMode: "small",
        navigation: "sidebar",
        backgroundPattern: "none",
        cardShape: "rounded",
        fontPreset: "default",
    },
    "neon-grid": {
        templateKey: "neon-grid",
        layoutType: "dashboard-sidebar",
        heroMode: "small",
        navigation: "sidebar",
        backgroundPattern: "grid-neon",
        cardShape: "rounded",
        fontPreset: "default",
    },
    "minimal-glass": {
        templateKey: "minimal-glass",
        layoutType: "dashboard-topnav",
        heroMode: "small",
        navigation: "topnav",
        backgroundPattern: "none",
        cardShape: "glass",
        fontPreset: "minimal",
    },
    "terminal-dark": {
        templateKey: "terminal-dark",
        layoutType: "terminal",
        heroMode: "none",
        navigation: "sidebar",
        backgroundPattern: "scanline",
        cardShape: "square",
        fontPreset: "mono",
    },
    "aurora-landing": {
        templateKey: "aurora-landing",
        layoutType: "marketing-landing",
        heroMode: "full",
        navigation: "topnav",
        backgroundPattern: "aurora",
        cardShape: "rounded",
        fontPreset: "default",
    },
    "modular-blocks": {
        templateKey: "modular-blocks",
        layoutType: "blocks",
        heroMode: "none",
        navigation: "sidebar",
        backgroundPattern: "none",
        cardShape: "block",
        fontPreset: "default",
    }
};

export default function CatalogDemoPage() {
    const [activeTemplate, setActiveTemplate] = useState<string>("default-classic");

    return (
        <div className="relative">
            {/* Dev Switcher Bar - Flutua acima de tudo para poder testar as "Skins Absolutas" */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] bg-white text-black p-2 rounded-full shadow-2xl flex items-center gap-2 border border-slate-200">
                <span className="text-xs font-bold pl-3 pr-2 text-slate-400">DEMO SWITCHER</span>
                {Object.keys(catalog).map((key) => (
                    <button
                        key={key}
                        onClick={() => setActiveTemplate(key)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${activeTemplate === key
                                ? 'bg-black text-white shadow-md'
                                : 'bg-transparent text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {key.split('-')[0].toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Renderiza o Portal da Comunidade passando as Configurações "Fake" escolhidas pelo botão */}
            <CommunityPortal
                config={catalog[activeTemplate]}
                community={mockCommunity}
            />
        </div>
    );
}
