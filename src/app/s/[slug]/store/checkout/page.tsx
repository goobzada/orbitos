'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Loader2, AlertCircle, CreditCard, Zap, Shield } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description?: string;
    priceCents: number;
    billingCycle: string;
    category?: string;
    thumbnailUrl?: string;
    deliveryType: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StoreCheckoutPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = params.slug as string;
    const productId = searchParams.get('product');

    const [product, setProduct] = useState<Product | null>(null);
    const [orgName, setOrgName] = useState('');
    const [discordId, setDiscordId] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            if (!productId) {
                router.replace(`/s/${slug}/store`);
                return;
            }
            try {
                const [portalRes, productsRes] = await Promise.all([
                    fetch(`${API_URL}/public/portal/${slug}`),
                    fetch(`${API_URL}/public/store/${slug}/products`),
                ]);

                if (!portalRes.ok) {
                    setError('Comunidade não encontrada.');
                    setLoading(false);
                    return;
                }

                const portalData = await portalRes.json();
                setOrgName(portalData.organization?.name || slug);

                if (productsRes.ok) {
                    const products: Product[] = await productsRes.json();
                    const found = products.find(p => p.id === productId);
                    if (!found) {
                        router.replace(`/s/${slug}/store`);
                        return;
                    }
                    setProduct(found);
                }
            } catch {
                setError('Erro ao carregar produto.');
            } finally {
                setLoading(false);
            }
        }

        if (slug) load();
    }, [slug, productId, router]);

    const handleCheckout = async () => {
        if (!product) return;
        if (!discordId.trim()) {
            setError('Informe seu ID do Discord para receber a entrega automática.');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/public/store/${slug}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    externalCustomerId: discordId.trim(),
                    items: [{
                        productId: product.id,
                        quantity: 1,
                        priceCents: product.priceCents,
                        billingCycle: product.billingCycle,
                        name: product.name,
                        description: product.description,
                    }],
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao iniciar pagamento.');
            }

            const { checkoutUrl } = await res.json();

            if (!checkoutUrl) throw new Error('URL de checkout não retornada.');

            // Redireciona para o Stripe Checkout
            window.location.href = checkoutUrl;
        } catch (err: any) {
            setError(err.message || 'Erro ao processar. Tente novamente.');
            setProcessing(false);
        }
    };

    const formatPrice = (cents: number, cycle: string) => {
        const price = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (cycle === 'MONTHLY') return `${price}/mês`;
        if (cycle === 'YEARLY') return `${price}/ano`;
        return price;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white/40">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="text-sm">Carregando produto...</p>
                </div>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center text-white/60">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p>{error}</p>
                    <Link href={`/s/${slug}/store`} className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-sm underline">
                        Voltar à loja
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0d0d18]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href={`/s/${slug}/store`}
                        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Voltar à loja
                    </Link>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/60">
                        <ShoppingBag size={14} />
                        {orgName}
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

                    {/* Left: Product summary */}
                    <div className="md:col-span-3 space-y-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">Finalizar Compra</p>
                            <h1 className="text-3xl font-black tracking-tight">{product?.name}</h1>
                            {product?.description && (
                                <p className="text-white/50 mt-3 leading-relaxed text-sm">{product.description}</p>
                            )}
                        </div>

                        {/* Thumbnail */}
                        {product?.thumbnailUrl && (
                            <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                                <img
                                    src={product.thumbnailUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Trust badges */}
                        <div className="space-y-3">
                            {[
                                { icon: Zap, text: 'Entrega automática via Discord após confirmação do pagamento' },
                                { icon: Shield, text: 'Pagamento processado com segurança pelo Stripe' },
                                { icon: CreditCard, text: 'Aceitamos cartão de crédito, débito e boleto' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm text-white/40">
                                    <item.icon size={14} className="mt-0.5 shrink-0 text-violet-400" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Checkout form */}
                    <div className="md:col-span-2">
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-6 sticky top-6">
                            {/* Price */}
                            <div>
                                <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Total</p>
                                <p className="text-4xl font-black text-violet-400">
                                    {product ? formatPrice(product.priceCents, product.billingCycle) : '—'}
                                </p>
                                {product?.billingCycle !== 'ONE_TIME' && (
                                    <p className="text-xs text-white/30 mt-1">Cobrança recorrente — cancele quando quiser</p>
                                )}
                            </div>

                            <div className="border-t border-white/5" />

                            {/* Discord ID */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/50 block">
                                    Seu ID do Discord *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 123456789012345678"
                                    value={discordId}
                                    onChange={e => setDiscordId(e.target.value.replace(/\D/g, ''))}
                                    maxLength={20}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
                                />
                                <p className="text-[11px] text-white/25 leading-relaxed">
                                    Necessário para entrega automática do cargo/benefício no servidor Discord.
                                    {' '}<a
                                        href="https://support.discord.com/hc/pt-br/articles/206346498"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-400 hover:underline"
                                    >
                                        Como encontrar meu ID?
                                    </a>
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* CTA */}
                            <button
                                onClick={handleCheckout}
                                disabled={processing || !discordId.trim()}
                                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all
                                    bg-violet-600 hover:bg-violet-500 text-white
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2
                                    shadow-lg shadow-violet-500/20"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={16} />
                                        Pagar com Stripe
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-white/20 text-center leading-relaxed">
                                Ao clicar em "Pagar", você será redirecionado para o checkout seguro do Stripe.
                                Seus dados de pagamento nunca são armazenados no OrbitOS.
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 mt-16">
                <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-white/20">
                    <span>Powered by <a href="https://orbitup.io" className="text-violet-400 hover:underline">OrbitOS</a></span>
                    <span>© {orgName}</span>
                </div>
            </footer>
        </div>
    );
}
