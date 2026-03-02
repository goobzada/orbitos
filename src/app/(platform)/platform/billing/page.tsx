'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, UserMinus, ArrowUpRight, CreditCard } from "lucide-react";

import { usePlatformOverview, usePlatformPayments } from "@/lib/hooks";

export default function PlatformBilling() {
    const { data: overview, isLoading: loadingOverview } = usePlatformOverview();
    const { data: payments = [], isLoading: loadingPayments } = usePlatformPayments();

    if (loadingOverview || loadingPayments) {
        return <div className="p-10 text-center animate-pulse">Carregando métricas globais...</div>;
    }

    const mrr = overview?.revenue?.totalRevenue || 0;
    const stats = overview?.totals || {};
    const distribution = overview?.orgDistribution || {};

    const planStats = [
        { name: "FREE", count: distribution.FREE || 0, revenue: "R$ 0", color: "text-muted-foreground" },
        { name: "PRO", count: distribution.PRO || 0, revenue: `R$ ${(distribution.PRO * 450).toLocaleString()}`, color: "text-violet-400" },
        { name: "ENTERPRISE", count: distribution.ENTERPRISE || 0, revenue: `R$ ${(distribution.ENTERPRISE * 1200).toLocaleString()}`, color: "text-amber-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing Global</h1>
                <p className="text-muted-foreground">Receita, churn e conversão de toda a plataforma.</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {mrr.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground italic">Acumulado histórico</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Orgs Pagas</CardTitle>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{(distribution.PRO || 0) + (distribution.ENTERPRISE || 0)}</div>
                        <p className="text-xs text-muted-foreground">De um total de {stats.totalOrganizations || 0}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-rose-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Ticket Volume</CardTitle>
                        <UserMinus className="w-4 h-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{stats.totalTickets || 0}</div>
                        <p className="text-xs text-muted-foreground">Suporte vitalício</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
                        <CreditCard className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{stats.totalPayments || 0}</div>
                        <p className="text-xs text-muted-foreground">Transações efetuadas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Plan */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle>Receita por Plano (Estimada)</CardTitle>
                        <CardDescription>Breakdown de MRR baseado em tiers de preço.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {planStats.map((p) => (
                            <div key={p.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={p.color}>{p.name}</Badge>
                                    <span className="text-sm text-muted-foreground">{p.count} órgãos</span>
                                </div>
                                <span className="font-mono font-semibold">{p.revenue}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle>Últimas Transações</CardTitle>
                        <CardDescription>Últimos pagamentos processados pela infra.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {payments.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground italic text-sm">Nenhum pagamento processado.</div>
                        ) : payments.map((p: any, i: number) => (
                            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{p.organization?.name || "Org Desconhecida"}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{p.paymentMethod} • {new Date(p.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-amber-400">R$ {p.amount.toLocaleString()}</span>
                                    <Badge variant="secondary" className={
                                        p.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                    }>
                                        {p.status === "paid" ? "Pago" : "Falhou"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
