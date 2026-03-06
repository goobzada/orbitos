'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CommunityPortal } from '@/components/templates/CommunityPortal';
import { ThemeProvider } from '@/contexts/theme-context';
import { buildTheme, themeToCSS, ThemeTokens } from '@/lib/theme';
import { CommunityData } from '@/components/templates/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Precisamos simular o "Preset" na viga base do preview
// para o theme.ts saber mapear o layoutType, navigation, etc
const MOCK_PRESETS: Record<string, any> = {
    'default-classic': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'rounded' },
    'neon-grid': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'grid-neon', cardShape: 'block' },
    'minimal-glass': { layoutType: 'dashboard-topnav', navigation: 'topnav', heroMode: 'small', backgroundPattern: 'none', cardShape: 'glass', fontPreset: 'minimal' },
    'terminal-dark': { layoutType: 'terminal', navigation: 'sidebar', heroMode: 'none', backgroundPattern: 'scanline', cardShape: 'square', fontPreset: 'mono' },
    'aurora-landing': { layoutType: 'marketing-landing', navigation: 'topnav', heroMode: 'full', backgroundPattern: 'aurora', cardShape: 'rounded' },
    'modular-blocks': { layoutType: 'blocks', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'block' },
    'cosmic-ultra': { layoutType: 'cosmic-ultra', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'cosmos', cardShape: 'glass-intense', fontPreset: 'modern', templateKey: 'cosmic-ultra' },
    'obsidian-empire': { layoutType: 'obsidian-empire', navigation: 'none', heroMode: 'full', backgroundPattern: 'none', cardShape: 'square', fontPreset: 'luxury', templateKey: 'obsidian-empire', primaryColor: '#C9A84C', backgroundColor: '#050505' },
    'hologram-pro': { layoutType: 'hologram-pro', navigation: 'topnav', heroMode: 'full', backgroundPattern: 'none', cardShape: 'square', fontPreset: 'mono', templateKey: 'hologram-pro', primaryColor: '#00F5FF', backgroundColor: '#01040D' },
};

export default function PreviewIframePage() {
    const [orgId, setOrgId] = useState('');

    const [theme, setTheme] = useState<ThemeTokens | null>(null);
    const [community, setCommunity] = useState<CommunityData>({
        name: 'Comunidade Preview',
        description: "Este preview usa os dados reais da organização selecionada.",
        avatar: "https://avatar.vercel.sh/preview",
        modules: []
    });
    const hasReceivedUpdate = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const nextOrgId = params.get('orgId') || '';
        const nextOrgName = params.get('orgName') || 'Comunidade Preview';
        setOrgId(nextOrgId);
        setCommunity((prev) => ({ ...prev, name: nextOrgName }));
    }, []);

    useEffect(() => {
        async function loadInitialIdentity() {
            if (!orgId) return;
            try {
                const identityRes = await fetch(`${API_URL}/templates/identity/${orgId}`, {
                    credentials: 'include',
                });

                if (!identityRes.ok) return;

                const identity = await identityRes.json();
                const preset = identity?.preset || { config: MOCK_PRESETS['default-classic'] };
                const initialTheme = buildTheme(identity, preset);
                setTheme(initialTheme);
            } catch {
                // fallback to postMessage flow
            }
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_UPDATE') {
                const form = event.data.payload?.form || event.data.payload;
                const incomingCommunity = event.data.payload?.community;
                const presetConf = MOCK_PRESETS[form.templateKey] || MOCK_PRESETS['default-classic'];
                const newTheme = buildTheme(form, { config: presetConf });

                hasReceivedUpdate.current = true;
                setTheme(newTheme);

                if (incomingCommunity) {
                    setCommunity((prev) => ({
                        ...prev,
                        name: incomingCommunity.name || prev.name,
                        description: incomingCommunity.description || prev.description,
                        avatar: incomingCommunity.avatar || prev.avatar,
                    }));
                }
            }
        };

        window.addEventListener('message', handleMessage);
        loadInitialIdentity();

        // Handshake: envia READY periodicamente até receber o primeiro UPDATE
        const readyInterval = setInterval(() => {
            if (!hasReceivedUpdate.current) {
                window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
            } else {
                clearInterval(readyInterval);
            }
        }, 500);

        // Fallback: se em 3s não receber nada, carrega o default
        const fallbackTimeout = setTimeout(() => {
            if (!hasReceivedUpdate.current && !theme) {
                const defaultTheme = buildTheme(null, { config: MOCK_PRESETS['default-classic'] });
                setTheme(defaultTheme);
            }
        }, 3000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(readyInterval);
            clearTimeout(fallbackTimeout);
        };
    }, [orgId]);

    if (!theme) {
        return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white/50 text-sm">Carregando preview...</div>;
    }

    return (
        <ThemeProvider value={theme}>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                   ${themeToCSS(theme)}
                }
                body {
                    background-color: var(--color-background);
                    color: var(--color-text);
                    font-family: var(--font-family);
                }
                ${theme.customCss || ''}
            `}} />
            <CommunityPortal
                config={theme as any} // O Portal usa o ThemeTokens mesclado
                community={community}
            />
        </ThemeProvider>
    );
}
