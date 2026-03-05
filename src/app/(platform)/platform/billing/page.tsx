'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, UserMinus, ArrowUpRight, CreditCard, Receipt, Users, AlertCircle } from "lucide-react";
import Link from "next/link";

import { usePlatformBillingOverview, usePlatformOverview } from "@/lib/hooks";

export default function PlatformBilling() {
    const { data: billingOverview, isLoading: loadingBilling } = usePlatformBillingOverview();
    const { data: overview, isLoading: loadingOverview } = usePlatformOverview();

    if (loadingBilling || loadingOverview) {
        return <div className="p-10 text-center animate-pulse">Carregando métricas de billing...</div>;
    }

    const mrr = billingOverview?.mrr || 0;
    const arr = billingOverview?.arr || 0;
    const activeSubscriptions = billingOverview?.activeSubscriptions || 0;
    const trials = billingOverview?.trials || 0;
    const pastDue = billingOverview?.pastDue || 0;
    const canceledLast30d = billingOverview?.canceledLast30d || 0;
    const revenueLast30d = billingOverview?.revenueLast30d || 0;

    const distribution = overview?.orgDistribution || {};

    const formatCents = (cents: number) =>
        (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Global</h1>
                    <p className="text-muted-foreground">Receita, assinaturas e faturamento da plataforma Orbitos.</p>
                    <p className="text-xs text-muted-foreground mt-1 opacity-60">Recebimento via conta Stripe principal do SaaS (merchant único).</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/platform/billing/subscriptions">Ver Assinaturas</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/platform/billing/invoices">Ver Faturas</Link>
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">MRR</CardTitle>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCents(mrr)}</div>
                        <p className="text-xs text-muted-foreground">ARR: {formatCents(arr)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                        <Users className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{activeSubscriptions}</div>
                        <p className="text-xs text-muted-foreground">{trials} em trial</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-rose-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Past Due / Inadimplentes</CardTitle>
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{pastDue}</div>
                        <p className="text-xs text-muted-foreground">{canceledLast30d} cancelados (30d)</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Receita (30d)</CardTitle>
                        <CreditCard className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{formatCents(revenueLast30d)}</div>
                        <p className="text-xs text-muted-foreground">Líquido via Stripe</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Plan + Quick Links */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle>Distribuição por Plano</CardTitle>
                        <CardDescription>Tenants por tier de assinatura.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: "FREE", count: distribution.FREE || 0, color: "text-muted-foreground" },
                            { name: "PRO", count: distribution.PRO || 0, color: "text-violet-400" },
                            { name: "ENTERPRISE", count: distribution.ENTERPRISE || 0, color: "text-amber-400" },
                            { name: "MAX", count: distribution.MAX || 0, color: "text-rose-400" },
                        ].map((p) => (
                            <div key={p.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={p.color}>{p.name}</Badge>
                                </div>
                                <span className="font-mono font-semibold">{p.count} orgs</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                        <CardDescription>Acesse seções de billing detalhadas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/platform/billing/subscriptions">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-border/50">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm font-medium">Assinaturas</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </Link>
                        <Link href="/platform/billing/invoices">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-border/50">
                                <div className="flex items-center gap-3">
                                    <Receipt className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm font-medium">Faturas</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </Link>
                        <Link href="/platform/organizations">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-border/50">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-medium">Gerenciar Tenants</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
