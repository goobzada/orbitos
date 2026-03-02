'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Zap, TrendingUp } from "lucide-react";
import { usePlatformOverview, usePlatformOrganizations } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformOverview() {
    const { data: stats, isLoading: loadingStats } = usePlatformOverview();
    const { data: orgs, isLoading: loadingOrgs } = usePlatformOrganizations();

    if (loadingStats) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const metrics = stats?.totals || {};
    const revenue = stats?.revenue || {};
    const recentOrgs = (orgs || []).slice(0, 5);
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Overview Global</h1>
                <p className="text-muted-foreground">Bem-vindo ao centro de controle da infraestrutura OrbitOS.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Organizações</CardTitle>
                        <Building2 className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalOrganizations || 0}</div>
                        <p className="text-xs text-muted-foreground">Infraestrutura multi-tenant</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {(revenue.totalRevenue || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Volume de transações processadas</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tickets Globais</CardTitle>
                        <Zap className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalTickets || 0}</div>
                        <p className="text-xs text-muted-foreground">Sincronizados com Discord</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
                        <Users className="w-4 h-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">Membros únicos na base</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle>Crescimento da Plataforma</CardTitle>
                        <CardDescription>Evolução de organizações e faturamento nos últimos 6 meses.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                        <p className="text-muted-foreground italic">Gráfico de Crescimento (Chart placeholder)</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle>Organizações Recentes</CardTitle>
                        <CardDescription>Novos clientes na plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrgs.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Nenhuma organização cadastrada.</p>
                            ) : (
                                recentOrgs.map((org: any) => (
                                    <div key={org.id} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-[10px] font-bold">
                                            {org.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{org.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Dono: {org.owner?.username || "Desconhecido"} • {org.plan}
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-mono opacity-60">
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-4 border-t border-amber-500/10">
                <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-sm cursor-pointer hover:bg-red-500/10 transition-colors" onClick={() => window.location.href = '/platform/support'}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-500 text-xl font-bold">PIN</span>
                        </div>
                        <div>
                            <CardTitle className="text-red-500">Acesso via PIN (Impersonation)</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Entre na conta de um cliente de forma segura utilizando um código gerado por ele.
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
