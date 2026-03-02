"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    AreaChart,
    Area,
    LineChart,
    Line
} from "recharts";
import { TrendingUp, Users, MessageSquare, ShieldAlert } from "lucide-react";

import { useParams } from "next/navigation";
import { useOrgAnalytics } from "@/lib/hooks";
import { useActiveOrg } from "@/lib/use-org-store";

const chartConfig = {
    total: {
        label: "Tickets Totais",
        color: "hsl(var(--primary))",
    },
    active: {
        label: "Abertos",
        color: "hsl(var(--amber-500))",
    },
} satisfies ChartConfig;

export default function AnalyticsPage() {
    const params = useParams();
    const { activeOrgId } = useActiveOrg();

    const organizationId = (params?.organizationId as string) || activeOrgId;
    const { data: analytics, isLoading } = useOrgAnalytics(organizationId as string);

    if (!organizationId) return <div className="p-8 text-center text-muted-foreground italic">Selecione uma organização para ver o analytics.</div>;
    if (isLoading) return <div className="p-8 text-center animate-pulse">Calculando métricas...</div>;

    const stats = analytics?.overview || {};
    const chartData = analytics?.chart || [];
    const series = analytics?.series || [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics do Tenant</h1>
                    <p className="text-muted-foreground font-medium italic">
                        Visão geral do ecossistema {typeof organizationId === 'string' ? organizationId.slice(0, 8) : 'N/A'}...
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tickets Totais</CardTitle>
                        <MessageSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.totalTickets}</div>
                        <p className="text-[10px] text-emerald-500 font-bold">Histórico completo</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aguardando Suporte</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-500">{stats.openTickets}</div>
                        <p className="text-[10px] text-muted-foreground">Tickets 'OPEN' agora</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/10 text-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Receita Bruta</CardTitle>
                        <TrendingUp className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">R$ {stats.revenue.toLocaleString()}</div>
                        <p className="text-[10px] text-muted-foreground">Processado via Driver Layer</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 text-blue-500">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Membros / Staff</CardTitle>
                        <Users className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{stats.members}</div>
                        <p className="text-[10px] text-muted-foreground">Na sua organização</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-border/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Fluxo de Requisições</CardTitle>
                        <CardDescription>Crescimento orgânico de tickets por semana.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ChartContainer config={chartConfig}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.05} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#colorTotal)" strokeWidth={2} />
                                <Area type="monotone" dataKey="active" stroke="rgb(245,158,11)" fill="rgba(245,158,11,0.1)" strokeWidth={2} />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Performance Core</CardTitle>
                        <CardDescription>KPIs de entrega e satisfação.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {series.map((s: any) => (
                            <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/5">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{s.name}</p>
                                    <p className="text-xl font-black">{s.value}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${s.trending === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {s.trending === 'up' ? '↑' : '↓'} TRENDING
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 mt-4 border-t border-border/10 flex flex-col gap-2">
                            <p className="text-[10px] text-muted-foreground text-center">Dashboard de analytics em tempo real powered by OrbitOS Core.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
