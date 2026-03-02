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
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/public/portal/${slug}`);
                if (!response.ok) throw new Error('Comunidade não encontrada.');

                const data = await response.json();
                const identity = data.identity || {};
                const org = data.organization;
                const preset = identity.preset || { config: {} };

                // O layout e o modo de exibição vêm do preset
                const config: TemplateConfig = {
                    templateKey: identity.templateKey || preset.key || 'default-classic',
                    layoutType: preset.config?.layoutType || 'dashboard-sidebar',
                    heroMode: preset.config?.heroMode || 'small',
                    navigation: preset.config?.navigation || 'sidebar',
                    backgroundPattern: preset.config?.backgroundPattern || 'none',
                    cardShape: preset.config?.cardShape || 'rounded',
                    fontPreset: preset.config?.fontPreset || 'default'
                };

                const comm: CommunityData = {
                    name: org.name,
                    description: "Seja bem vindo à nossa comunidade. Adquira VIPs na loja e solicite suporte.",
                    avatar: identity.logoUrl || "https://avatar.vercel.sh/community",
                    modules: []
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
