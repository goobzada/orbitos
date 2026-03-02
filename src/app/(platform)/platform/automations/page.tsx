'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, Play, Pause, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    usePlatformAutomations,
    usePlatformAutomationLogs,
    useTogglePlatformAutomation,
    usePlatformOverview
} from "@/lib/hooks";

export default function PlatformAutomations() {
    const { data: overview } = usePlatformOverview();
    const { data: rules = [], isLoading: loadingRules } = usePlatformAutomations();
    const { data: logs = [], isLoading: loadingLogs } = usePlatformAutomationLogs();
    const toggleRule = useTogglePlatformAutomation();

    const stats = overview?.operational || {};

    // Estimativa de total de ativações se o overview não der
    const totalRulesCount = rules.length;
    const activeRulesCount = rules.filter(r => r.isActive).length;

    const handleToggle = async (id: string, name: string) => {
        try {
            await toggleRule.mutateAsync(id);
            toast.success(`Regra "${name}" atualizada.`);
        } catch (error) {
            toast.error("Erro ao alterar status da regra.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Automações Globais</h1>
                    <p className="text-muted-foreground">Monitoramento e controle de regras em toda a rede OrbitOS.</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-amber-500">
                        <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
                        <Zap className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRulesCount}</div>
                        <p className="text-xs text-muted-foreground">De um total de {totalRulesCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-emerald-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-emerald-500">
                        <CardTitle className="text-sm font-medium">Executadas (30d)</CardTitle>
                        <Play className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.automationsLast30Days || 0}</div>
                        <p className="text-xs text-muted-foreground">Sucesso operacional</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-rose-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-rose-500">
                        <CardTitle className="text-sm font-medium">Falhas (24h)</CardTitle>
                        <XCircle className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.errorsLast24Hours || 0}</div>
                        <p className="text-xs text-muted-foreground">Requer atenção</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-blue-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-blue-500">
                        <CardTitle className="text-sm font-medium">Latência Média</CardTitle>
                        <Clock className="w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">~150ms</div>
                        <p className="text-xs text-muted-foreground">Evento → Processamento</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Rules Table */}
            <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10 overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle>Regras de Tenants</CardTitle>
                    <CardDescription>Visão global de todas as automações configuradas nos servidores.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Nome da Regra</TableHead>
                                <TableHead>Trigger</TableHead>
                                <TableHead>Organização</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Ação Admin</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingRules ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10">Carregando...</TableCell></TableRow>
                            ) : rules.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">Nenhuma regra configurada.</TableCell></TableRow>
                            ) : rules.map((rule) => (
                                <TableRow key={rule.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="font-semibold pl-6">{rule.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px] bg-amber-500/5">{rule.trigger}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm font-medium italic">{rule.organization?.name || "Desconhecida"}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={
                                            rule.isActive
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                        }>
                                            {rule.isActive ? "Ativa" : "Pausada"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className={cn("h-8 gap-1.5", rule.isActive ? "text-rose-400 hover:text-rose-300" : "text-emerald-400 hover:text-emerald-300")}
                                            onClick={() => handleToggle(rule.id, rule.name)}
                                            disabled={toggleRule.isPending}
                                        >
                                            {rule.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                            <span className="font-bold uppercase tracking-wider text-[10px]">
                                                {rule.isActive ? 'Desativar Global' : 'Ativar Global'}
                                            </span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Logs */}
            <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                <CardHeader>
                    <CardTitle>Stream de Execução (Logs Reais)</CardTitle>
                    <CardDescription>Eventos processados recentemente pela infraestrutura.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {loadingLogs ? (
                            <div className="text-center py-6 text-muted-foreground animate-pulse">Carregando logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground italic text-sm">Nenhum log disponível.</div>
                        ) : logs.map((log) => (
                            <div key={log.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-muted/20 border border-border/5 hover:border-amber-500/20 transition-all">
                                {log.status === "SUCCESS" ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                )}
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <span className="text-sm font-medium truncate">{log.rule?.name || "Regra Excluída"}</span>
                                    {log.error && <span className="text-[10px] text-rose-400/80 truncate">{log.error}</span>}
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">{log.triggerEvent}</Badge>
                                </div>
                                <div className="flex flex-col items-end shrink-0 min-w-[80px]">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
