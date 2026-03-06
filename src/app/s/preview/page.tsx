'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CommunityPortal } from '@/components/templates/CommunityPortal';
import { ThemeProvider } from '@/contexts/theme-context';
import { buildTheme, themeToCSS, ThemeTokens } from '@/lib/theme';
import { CommunityData } from '@/components/templates/types';

const mockCommunity: CommunityData = {
    name: "Comunidade Preview",
    description: "Este é um preview ao vivo de como seu portal ficará público.",
    avatar: "https://avatar.vercel.sh/preview",
    modules: []
};

// Precisamos simular o "Preset" na viga base do preview
// para o theme.ts saber mapear o layoutType, navigation, etc
const MOCK_PRESETS: Record<string, any> = {
    'default-classic': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'rounded' },
    'neon-grid': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'grid-neon', cardShape: 'block' },
    'minimal-glass': { layoutType: 'dashboard-topnav', navigation: 'topnav', heroMode: 'small', backgroundPattern: 'none', cardShape: 'glass', fontPreset: 'minimal' },
    'terminal-dark': { layoutType: 'terminal', navigation: 'sidebar', heroMode: 'none', backgroundPattern: 'scanline', cardShape: 'square', fontPreset: 'mono' },
    'aurora-landing': { layoutType: 'marketing-landing', navigation: 'topnav', heroMode: 'full', backgroundPattern: 'aurora', cardShape: 'rounded' },
    'modular-blocks': { layoutType: 'blocks', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'none', cardShape: 'block' },
    'cosmic-ultra': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'small', backgroundPattern: 'cosmos', cardShape: 'glass-intense', fontPreset: 'modern' },
    'obsidian-empire': { layoutType: 'dashboard-sidebar', navigation: 'sidebar', heroMode: 'full', backgroundPattern: 'obsidian-grid', cardShape: 'sharp-gold', fontPreset: 'luxury' },
    'hologram-pro': { layoutType: 'dashboard-topnav', navigation: 'topnav', heroMode: 'full', backgroundPattern: 'hologram-mesh', cardShape: 'holo-glass', fontPreset: 'tech' },
};

export default function PreviewIframePage() {
    const [theme, setTheme] = useState<ThemeTokens | null>(null);
    const hasReceivedUpdate = useRef(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_UPDATE') {
                const form = event.data.payload;
                const presetConf = MOCK_PRESETS[form.templateKey] || MOCK_PRESETS['default-classic'];
                const newTheme = buildTheme(form, { config: presetConf });

                hasReceivedUpdate.current = true;
                setTheme(newTheme);
            }
        };

        window.addEventListener('message', handleMessage);

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
    }, []);

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
                community={mockCommunity}
            />
        </ThemeProvider>
    );
}
