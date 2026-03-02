'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server, Ticket, Users, BarChart3, Activity, ShieldCheck, BadgeCheck, ShieldAlert } from "lucide-react";
import { OverviewChart } from "@/components/charts/overview-chart";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useOverviewStats, useRecentActivity } from "@/lib/hooks";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DashboardOverview() {
    const { data: overviews, isLoading: isLoadingStats } = useOverviewStats();
    const { data: activities = [], isLoading: isLoadingActivity } = useRecentActivity(10);

    const statsConfig = [
        {
            title: "Servidores Ativos",
            value: overviews?.activeServers?.toLocaleString() || "0",
            trend: overviews?.activeServersTrend || 0,
            comparisonLabel: "vs mês passado",
            icon: Server,
            color: "violet" as const,
            sparkline: [{ value: 10 }, { value: 15 }, { value: 8 }, { value: 20 }, { value: 18 }, { value: 25 }]
        },
        {
            title: "Tickets Abertos",
            value: overviews?.openTickets?.toLocaleString() || "0",
            trend: overviews?.openTicketsTrend || 0,
            comparisonLabel: "Tickets em aberto agora",
            icon: Ticket,
            color: "amber" as const,
            sparkline: [{ value: 30 }, { value: 25 }, { value: 35 }, { value: 20 }, { value: 28 }, { value: 15 }]
        },
        {
            title: "Staff Online",
            value: overviews?.staffOnline?.toLocaleString() || "0",
            trend: overviews?.staffTrend || 0,
            comparisonLabel: "Moderadores ativos",
            icon: Users,
            color: "emerald" as const,
            sparkline: [{ value: 5 }, { value: 8 }, { value: 4 }, { value: 12 }, { value: 9 }, { value: 11 }]
        },
        {
            title: "Receita (24h)",
            value: overviews?.revenue24h !== undefined ? `R$ ${overviews.revenue24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00",
            trend: overviews?.revenueTrend || 0,
            comparisonLabel: "Vendas processadas",
            icon: BarChart3,
            color: "blue" as const,
            sparkline: [{ value: 100 }, { value: 150 }, { value: 120 }, { value: 200 }, { value: 180 }, { value: 220 }]
        },
    ];

    return (
        <DashboardShell>
            <div className="space-y-10 pb-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tightest bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent uppercase font-mono">
                            OVERVIEW_INFRA
                        </h1>
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            CONEXÃO ATIVA COM O MOTOR DE INFRAESTRUTURA
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsConfig.map((stat, idx) => (
                        <KpiCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            trend={stat.trend}
                            comparisonLabel={stat.comparisonLabel}
                            icon={stat.icon}
                            color={stat.color}
                            sparklineData={stat.sparkline}
                            delay={idx * 0.1}
                        />
                    ))}
                </div>

                {/* Middle Section: Charts & Activity */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Main Analytics Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-8"
                    >
                        <Card className="h-full border-border/5 bg-card/20 backdrop-blur-xl shadow-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-30">
                                <Activity className="w-20 h-20 text-primary/20 rotate-12" />
                            </div>
                            <CardHeader className="border-b border-border/5 bg-muted/10 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black tracking-tight uppercase">Crescimento_Mensal</CardTitle>
                                        <CardDescription className="text-xs font-medium">Volume de faturamento e ordens processadas.</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-primary">REVENUE_DATA</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 pt-6 pr-6">
                                <div className="h-[350px] w-full">
                                    <OverviewChart data={overviews?.chartData} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Real-time Activity Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-4"
                    >
                        <Card className="h-full border-border/5 bg-card/20 backdrop-blur-xl shadow-3xl flex flex-col">
                            <CardHeader className="border-b border-border/5 bg-muted/10 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black tracking-tight uppercase">Audit_Events</CardTitle>
                                        <CardDescription className="text-xs font-medium">Rastreamento de infraestrutura global.</CardDescription>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 max-h-[440px] custom-scrollbar">
                                <ActivityFeed activities={activities} />
                            </CardContent>
                            <div className="p-4 border-t border-border/5 bg-muted/5">
                                <button
                                    onClick={() => toast.info("Em breve: Log de Auditoria Completo", { description: "Esta funcionalidade será liberada na v1.3." })}
                                    className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Ver Log de Auditoria Completo
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Bottom Row - Decorative or Extra Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="grid gap-4 md:grid-cols-3"
                >
                    <div
                        onClick={() => toast.info("Segurança & Compliance", { description: "Sua instância OrbitOS está em conformidade com as políticas SOC2." })}
                        className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-between group cursor-help hover:scale-[1.02] transition-transform"
                    >
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">OrbitOS_Version</p>
                            <p className="text-xl font-black tracking-tighter">1.2.4-enterprise</p>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-primary/40 group-hover:scale-110 transition-transform" />
                    </div>
                    <div
                        onClick={() => toast.info("Garantia de Uptime", { description: "Monitoramento global de latência e disponibilidade." })}
                        className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 flex items-center justify-between group cursor-help hover:scale-[1.02] transition-transform"
                    >
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SLA_Commitment</p>
                            <p className="text-xl font-black tracking-tighter">99.98% Stable</p>
                        </div>
                        <BadgeCheck className="w-8 h-8 text-emerald-500/40 group-hover:scale-110 transition-transform" />
                    </div>
                    <div
                        onClick={() => toast.info("Isolamento de Dados", { description: "Protocolo Tenant-Strict isolando 100% dos dados por organização." })}
                        className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/10 flex items-center justify-between group cursor-help hover:scale-[1.02] transition-transform"
                    >
                        <div>
                            <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Data_Isolation</p>
                            <p className="text-xl font-black tracking-tighter">Tenant-Strict</p>
                        </div>
                        <ShieldAlert className="w-8 h-8 text-violet-500/40 group-hover:scale-110 transition-transform" />
                    </div>
                </motion.div>
            </div>
        </DashboardShell>
    );
}
