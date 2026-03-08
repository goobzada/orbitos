'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Zap, Rocket, CheckCircle } from 'lucide-react';
import { ThemeProvider } from '@/contexts/theme-context';
import { buildTheme, themeToCSS, ThemeTokens } from '@/lib/theme';

/** Returns a store-relative path that keeps custom domains clean.
 *  On custom domains (path doesn't start with /s/) uses relative paths.
 *  On the platform domain includes the full /s/[slug] prefix. */
function storeHref(slug: string, path: string): string {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/s/')) {
        return path || '/';
    }
    return `/s/${slug}${path}`;
}

interface Product {
    id: string;
    name: string;
    description?: string;
    priceCents: number;
    billingCycle: string;
    category?: string;
    thumbnailUrl?: string;
    deliveryType: string;
    status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PublicStorePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [orgName, setOrgName] = useState('');
    const [orgAvatar, setOrgAvatar] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState<ThemeTokens | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [portalRes, productsRes] = await Promise.all([
                    fetch(`${API_URL}/public/portal/${slug}`),
                    fetch(`${API_URL}/public/store/${slug}/products`),
                ]);

                if (portalRes.ok) {
                    const portalData = await portalRes.json();
                    setOrgName(portalData.organization?.name || slug);
                    setOrgAvatar(portalData.identity?.logoUrl || '');

                    // Reuse the exact same theme source as /s/[slug]
                    const identity = portalData.identity || {};
                    const preset = identity.preset || { config: {} };
                    const currentTheme = buildTheme(identity, preset);
                    setTheme(currentTheme);
                } else {
                    setError('Comunidade não encontrada.');
                    setLoading(false);
                    return;
                }

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    if (Array.isArray(data)) {
                        setProducts(data);
                    } else if (Array.isArray(data?.products)) {
                        setProducts(data.products);
                    } else {
                        setProducts([]);
                    }
                } else {
                    setError('Erro ao carregar produtos da loja.');
                }
            } catch {
                setError('Erro ao carregar loja.');
            } finally {
                setLoading(false);
            }
        }

        if (slug) load();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white/40">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    <p className="text-sm">Carregando loja...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-red-400">
                <p>{error}</p>
            </div>
        );
    }

    if (!theme) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/50">
                <p>Carregando tema...</p>
            </div>
        );
    }

    const categories = [...new Set(products.map(p => p.category || 'Geral').filter(Boolean))];

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
                .product-card:hover { border-color: color-mix(in srgb, var(--color-primary) 40%, transparent); }
                ${theme.customCss || ''}
            `}} />
        <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--color-background)' }}>
            {/* Header */}
            <div className="border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {orgAvatar ? (
                            <img src={orgAvatar} alt={orgName} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
                                <ShoppingBag className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                            </div>
                        )}
                        <div>
                            <h1 className="font-bold text-base leading-tight">{orgName}</h1>
                            <p className="text-[11px] text-white/30 tracking-wider uppercase">Loja Oficial</p>
                        </div>
                    </div>
                    <Link
                        href={storeHref(slug, '')}
                        className="text-xs text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5"
                    >
                        ← Portal
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                    <ShoppingBag className="w-3.5 h-3.5" /> Produtos
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight">
                    {products.length > 0 ? 'Escolha seu plano' : 'Em breve'}
                </h2>
                <p className="text-white/40 mt-2 text-sm">
                    {products.length > 0
                        ? `${products.length} produto${products.length !== 1 ? 's' : ''} disponível${products.length !== 1 ? 'is' : ''}`
                        : 'Nenhum produto disponível no momento.'}
                </p>
            </div>

            {/* Products */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                {products.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="text-6xl mb-6">🛒</div>
                        <p className="text-xl font-semibold text-white/30">Nenhum produto ativo.</p>
                        <p className="text-sm text-white/20 mt-2">Volte em breve!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {categories.map(category => {
                            const categoryProducts = products.filter(p => (p.category || 'Geral') === category);
                            return (
                                <div key={category}>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5 flex items-center gap-3">
                                        <span>{category}</span>
                                        <span className="flex-1 h-px bg-white/[0.06]" />
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {categoryProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="product-card group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur overflow-hidden hover:bg-white/[0.05] transition-all duration-300 flex flex-col"
                                            >
                                                {/* Thumbnail */}
                                                <div className="h-44 bg-white/[0.03] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {product.thumbnailUrl ? (
                                                        <img
                                                            src={product.thumbnailUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-white/10">
                                                            <ShoppingBag className="w-10 h-10" />
                                                        </div>
                                                    )}
                                                    {/* Billing badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                            {product.billingCycle === 'ONE_TIME'
                                                                ? <><Zap className="w-3 h-3 text-amber-400" /> Único</>
                                                                : product.billingCycle === 'MONTHLY'
                                                                    ? <><Rocket className="w-3 h-3" style={{ color: 'var(--color-primary)' }} /> Mensal</>
                                                                    : <><Rocket className="w-3 h-3 text-cyan-400" /> Anual</>}
                                                        </span>
                                                    </div>
                                                    {/* Delivery badge */}
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${product.deliveryType === 'MANUAL' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                                            {product.deliveryType === 'MANUAL' ? 'Manual' : <><CheckCircle className="w-3 h-3" /> Auto</>}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)' }}>{product.category || 'Geral'}</p>
                                                        <h4 className="font-bold text-base leading-snug">{product.name}</h4>
                                                        <p className="text-sm text-white/40 mt-1.5 line-clamp-2 leading-relaxed">
                                                            {product.description || 'Produto exclusivo da comunidade.'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                                        <div>
                                                            <p className="text-2xl font-black">
                                                                {(product.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </p>
                                                            <p className="text-[11px] text-white/30 mt-0.5">
                                                                {product.billingCycle === 'ONE_TIME' ? 'pagamento único' : product.billingCycle === 'MONTHLY' ? 'por mês' : 'por ano'}
                                                            </p>
                                                        </div>
                                                        <Link
                                                            href={storeHref(slug, `/store/checkout?product=${product.id}`)}
                                                            className="px-4 py-2 text-sm font-bold rounded-xl transition-opacity hover:opacity-80"
                                                            style={{ background: 'var(--color-primary)', color: 'var(--color-btn-text, #fff)' }}
                                                        >
                                                            Comprar
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.04]">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-[11px] text-white/15">
                    <span>Powered by <span style={{ color: 'var(--color-primary, #7c3aed)', opacity: 0.6 }}>OrbitOS</span></span>
                    <span>© {orgName}</span>
                </div>
            </div>
        </div>
        </ThemeProvider>
    );
}
