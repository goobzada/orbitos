"use client";

import { useOrganizations, useMe } from "@/lib/hooks";
import { useActiveOrg } from "@/lib/use-org-store";
import { Copy, PlusCircle, ShoppingCart, ShoppingBag, Settings2, Package, Tag, ArrowRight, Bot } from 'lucide-react';
import Link from 'next/link';

export default function StoreOverviewPage() {
    const { data: user } = useMe();
    const { activeOrgId } = useActiveOrg();
    const { data: orgs } = useOrganizations();
    const org = orgs?.find(o => o.id === activeOrgId);

    const isFree = org?.plan === 'FREE';

    // Mock dados para visualização enquanto não temos a API completa de estatísticas
    const stats = [
        { label: 'Receita Total', value: 'R$ 0,00', icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Pedidos Pendentes', value: '0', icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Produtos Ativos', value: '0', icon: Tag, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ];

    if (isFree) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-6 fade-in">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-2xl font-bold mb-2">Módulo de Loja Bloqueado</h2>
                        <p className="text-muted-foreground text-sm">
                            O Store Engine V1 está disponível apenas para assinantes do plano PRO, ENTERPRISE ou MAX.
                            Faça o upgrade para começar a vender itens e VIPs de forma automatizada.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors flex items-center gap-2">
                        Fazer Upgrade Agora <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 fade-in pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Loja VIP (Store Engine)</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie seus produtos, acompanhe vendas e entregas automatizadas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Acesso Rápido */}
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-violet-500" /> Gerenciar Loja
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/store/products" className="p-4 rounded-xl border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group flex flex-col gap-3">
                            <Tag className="w-5 h-5 text-muted-foreground group-hover:text-violet-500" />
                            <span className="font-semibold text-sm">Produtos</span>
                        </Link>
                        <Link href="/dashboard/store/orders" className="p-4 rounded-xl border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group flex flex-col gap-3">
                            <ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-violet-500" />
                            <span className="font-semibold text-sm">Pedidos</span>
                        </Link>
                        <Link href="/dashboard/store/settings" className="p-4 rounded-xl border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group flex flex-col gap-3 col-span-2">
                            <Settings2 className="w-5 h-5 text-muted-foreground group-hover:text-violet-500" />
                            <span className="font-semibold text-sm">Configurações e Integrações (Pix/Stripe)</span>
                        </Link>
                    </div>
                </div>

                {/* Automation Info */}
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                            <Bot className="w-5 h-5 text-blue-500" /> Automação e Entrega
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            O OrbitOS entrega seus produtos automaticamente via Discord Bots ou Webhooks para o FiveM/Minecraft assim que o pagamento for aprovado. Certifique-se de configurar a entrega corretamente em cada produto.
                        </p>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-4 items-center">
                        <div className="flex-1">
                            <div className="text-xs text-blue-400 font-bold mb-1">Status da API do Bot</div>
                            <div className="text-sm font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operacional
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
