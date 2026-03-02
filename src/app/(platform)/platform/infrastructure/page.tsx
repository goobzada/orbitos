'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Wifi, WifiOff, Activity, AlertTriangle, CheckCircle, Bot, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { usePlatformOverview, usePlatformInfra, usePlatformInfraErrors, useReconnectDriver } from "@/lib/hooks";

export default function PlatformInfra() {
    const { data: overview } = usePlatformOverview();
    const { data: drivers = [], isLoading: loadingDrivers } = usePlatformInfra();
    const { data: errors = [], isLoading: loadingErrors } = usePlatformInfraErrors();
    const reconnect = useReconnectDriver();

    const stats = overview?.operational || {};

    const handleReconnect = async (name: string) => {
        try {
            await reconnect.mutateAsync(name);
            toast.success(`Comando de reconexão enviado para ${name}`);
        } catch (error) {
            toast.error("Erro ao solicitar reconexão.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Drivers & Infraestrutura</h1>
                <p className="text-muted-foreground">Status de conexões, performance e logs de erro por organização.</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-emerald-500">
                        <CardTitle className="text-sm font-medium">Drivers Ativos</CardTitle>
                        <Cpu className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{drivers.filter(d => d.status === 'connected' || d.status === 'active').length}/{drivers.length}</div>
                        <p className="text-xs text-muted-foreground">Monitoramento em tempo real</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-blue-500">
                        <CardTitle className="text-sm font-medium">Uptime Médio</CardTitle>
                        <Activity className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.98%</div>
                        <p className="text-xs text-muted-foreground">SLA Cumprido</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-violet-500">
                        <CardTitle className="text-sm font-medium">Eventos (30d)</CardTitle>
                        <CheckCircle className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{stats.automationsLast30Days || 0}</div>
                        <p className="text-xs text-muted-foreground">Ações processadas</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-rose-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-rose-500">
                        <CardTitle className="text-sm font-medium">Erros (24h)</CardTitle>
                        <AlertTriangle className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{stats.errorsLast24Hours || 0}</div>
                        <p className="text-xs text-muted-foreground italic">Logs de falha</p>
                    </CardContent>
                </Card>
            </div>

            {/* Driver Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {loadingDrivers ? (
                    <div className="col-span-3 text-center py-10 animate-pulse">Consultando drivers...</div>
                ) : drivers.map((d) => (
                    <Card key={d.name} className="bg-card/50 backdrop-blur-sm border-amber-500/10 hover:border-amber-500/30 transition-all overflow-hidden group">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                <Bot className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-base truncate">{d.name}</CardTitle>
                                <div className="flex items-center gap-1.5">
                                    {(d.status === "connected" || d.status === "active") ? (
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${(d.status === "connected" || d.status === "active") ? "text-emerald-500" : "text-rose-500"}`}>
                                        {d.status === "connected" || d.status === "active" ? "Online" : "Offline"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2 text-center mb-4">
                                <div className="bg-muted/30 p-2 rounded">
                                    <p className="text-sm font-bold font-mono">{d.uptime}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase">Uptime</p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded">
                                    <p className="text-sm font-bold font-mono text-amber-400">{d.latency}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase">Ping</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-[10px] font-bold h-8 border-amber-500/20 hover:bg-amber-500/10"
                                    onClick={() => handleReconnect(d.name)}
                                    disabled={reconnect.isPending}
                                >
                                    <RefreshCw className={cn("w-3 h-3 mr-1.5", reconnect.isPending && "animate-spin")} />
                                    RECONECTAR
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Error Log */}
            <Card className="bg-card/50 backdrop-blur-sm border-rose-500/10 shadow-[0_0_20px_rgba(239,68,68,0.03)]">
                <CardHeader>
                    <CardTitle>Falhas de Infraestrutura (Últimas 24h)</CardTitle>
                    <CardDescription>Incidentes capturados durante a execução de drivers e automações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {loadingErrors ? (
                        <div className="text-center py-6 animate-pulse">Lendo logs de erro...</div>
                    ) : errors.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground italic text-sm border-2 border-dashed border-border/10 rounded-lg">Estável - Nenhum erro crítico capturado.</div>
                    ) : errors.map((e: any) => (
                        <div key={e.id} className="flex items-center gap-3 py-2.5 px-4 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-all group">
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-rose-100 truncate">{e.error || "Erro Desconhecido"}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">
                                    Driver: {e.triggerEvent || "Auto-Engine"} • Org: {e.organization?.name || "Global"}
                                </p>
                            </div>
                            <Badge variant="outline" className="text-[9px] border-rose-500/30 text-rose-400 font-bold bg-rose-500/5">CRITICAL</Badge>
                            <span className="text-xs font-mono text-muted-foreground">{new Date(e.createdAt).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
