"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CommunityPortal } from '@/components/templates/CommunityPortal';
import { ThemeProvider } from '@/contexts/theme-context';
import { buildTheme, themeToCSS, ThemeTokens } from '@/lib/theme';
import { CommunityData, TemplateConfig } from '@/components/templates/types';

export default function PublicCommunityPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [community, setCommunity] = useState<CommunityData | null>(null);
    const [config, setConfig] = useState<TemplateConfig | null>(null);
    const [theme, setTheme] = useState<ThemeTokens | null>(null);

    useEffect(() => {
        async function fetchCommunityData() {
            try {
                const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const [response, productsRes] = await Promise.all([
                    fetch(`${API}/public/portal/${slug}`),
                    fetch(`${API}/public/store/${slug}/products`).catch(() => null),
                ]);
                if (!response.ok) throw new Error('Comunidade não encontrada.');

                const data = await response.json();
                const identity = data.identity || {};
                const org = data.organization;
                const preset = identity.preset || { config: {} };

                // Fallback map: when preset is not seeded in DB, derive layoutType from templateKey
                const TEMPLATE_LAYOUT_MAP: Record<string, Partial<TemplateConfig>> = {
                    'default-classic': { layoutType: 'dashboard-sidebar', heroMode: 'small', navigation: 'sidebar', backgroundPattern: 'none', cardShape: 'rounded', fontPreset: 'default' },
                    'neon-grid': { layoutType: 'dashboard-topnav', heroMode: 'small', navigation: 'topnav', backgroundPattern: 'grid-neon', cardShape: 'glass', fontPreset: 'modern' },
                    'minimal-glass': { layoutType: 'dashboard-sidebar', heroMode: 'none', navigation: 'sidebar', backgroundPattern: 'none', cardShape: 'glass', fontPreset: 'minimal' },
                    'terminal-dark': { layoutType: 'terminal', heroMode: 'none', navigation: 'sidebar', backgroundPattern: 'scanline', cardShape: 'square', fontPreset: 'mono' },
                    'aurora-landing': { layoutType: 'marketing-landing', heroMode: 'full', navigation: 'topnav', backgroundPattern: 'aurora', cardShape: 'rounded', fontPreset: 'default' },
                    'modular-blocks': { layoutType: 'blocks', heroMode: 'small', navigation: 'sidebar', backgroundPattern: 'none', cardShape: 'block', fontPreset: 'default' },
                    'cosmic-ultra': { layoutType: 'dashboard-sidebar', heroMode: 'small', navigation: 'sidebar', backgroundPattern: 'cosmos', cardShape: 'glass-intense', fontPreset: 'modern' },
                    'obsidian-empire': { layoutType: 'obsidian-empire', heroMode: 'full', navigation: 'none', backgroundPattern: 'none', cardShape: 'square', fontPreset: 'luxury' },
                    'hologram-pro': { layoutType: 'hologram-pro', heroMode: 'full', navigation: 'topnav', backgroundPattern: 'none', cardShape: 'square', fontPreset: 'mono' },
                };

                const resolvedKey = identity.templateKey || identity.presetKey || preset.key || 'default-classic';
                const fallback = TEMPLATE_LAYOUT_MAP[resolvedKey] || TEMPLATE_LAYOUT_MAP['default-classic'];

                // O layout e o modo de exibição vêm do preset (com fallback estático se preset não estiver no DB)
                const config: TemplateConfig = {
                    templateKey: resolvedKey,
                    layoutType: preset.config?.layoutType || fallback.layoutType || 'dashboard-sidebar',
                    heroMode: preset.config?.heroMode || fallback.heroMode || 'small',
                    navigation: preset.config?.navigation || fallback.navigation || 'sidebar',
                    backgroundPattern: preset.config?.backgroundPattern || fallback.backgroundPattern || 'none',
                    cardShape: preset.config?.cardShape || fallback.cardShape || 'rounded',
                    fontPreset: preset.config?.fontPreset || fallback.fontPreset || 'default'
                };

                let storeProducts: any[] = [];
                if (productsRes?.ok) {
                    const pd = await productsRes.json();
                    storeProducts = Array.isArray(pd) ? pd : (pd?.products || []);
                }

                const comm: CommunityData = {
                    name: org.name,
                    description: "Seja bem vindo à nossa comunidade. Adquira VIPs na loja e solicite suporte.",
                    avatar: identity.logoUrl || "https://avatar.vercel.sh/community",
                    modules: storeProducts
                };

                // O buildTheme processa os tokens de identidade (cores, fontes, etc)
                const currentTheme = buildTheme(identity, preset);

                setTheme(currentTheme);
                setConfig(config);
                setCommunity(comm);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Erro ao carregar.';
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        if (slug) fetchCommunityData();
    }, [slug]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white/50">Carregando portal...</div>;
    if (error || !community || !config || !theme) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Erro: {error}</div>;

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
                config={{ ...config, ...theme } as TemplateConfig}
                community={community}
            />
        </ThemeProvider>
    );
}
