'use client';

import { useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, Plus, Filter, MoreHorizontal, Settings2, AlertCircle,
    Satellite, Wifi, WifiOff, Terminal
} from "lucide-react";
import { useServers, useDeleteServer, useAgentStatus } from "@/lib/hooks";
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";
import { Server } from "@/types";
import { AddServerModal } from "@/components/modals/add-server-modal";
import { ConfigServerModal } from "@/components/modals/config-server-modal";
import { toast } from "sonner";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";

const planBadgeClass = (plan: string) => {
    if (plan === "ENTERPRISE" || plan === "MAX") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (plan === "PRO") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

export default function ServersPage() {
    const { data: apiServers, isLoading, isError } = useServers();
    const { data: agentStatus } = useAgentStatus();
    const deleteServer = useDeleteServer();
    const servers = apiServers ?? [];

    const [addOpen, setAddOpen] = useState(false);
    const [configServer, setConfigServer] = useState<Server | null>(null);
    const [search, setSearch] = useState('');

    const connectedAgents = new Set(agentStatus?.agents ?? []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover o servidor "${name}"?`)) return;
        try {
            await deleteServer.mutateAsync(id);
            toast.success("Servidor removido com sucesso");
        } catch {
            toast.error("Erro ao remover servidor");
        }
    };

    const filteredServers = servers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.discordGuildId?.includes(search)
    );

    // Contagens para o banner de resumo
    const agentOnlineCount = servers.filter(s => connectedAgents.has(s.discordGuildId || s.id)).length;

    return (
        <TooltipProvider>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Modals */}
                <AddServerModal open={addOpen} onClose={() => setAddOpen(false)} />
                <ConfigServerModal
                    open={!!configServer}
                    onClose={() => setConfigServer(null)}
                    server={configServer}
                />

                {/* Header */}
                {isLoading ? <PageHeaderSkeleton /> : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Gestão de Servidores</h1>
                            <p className="text-muted-foreground">
                                Visualize e gerencie todos os servidores conectados à plataforma.
                                {isError && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-amber-400 text-xs">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Exibindo dados de demonstração (API offline)
                                    </span>
                                )}
                            </p>
                        </div>
                        <Button className="w-full md:w-auto gap-2" onClick={() => setAddOpen(true)}>
                            <Plus className="w-4 h-4" />
                            Adicionar Servidor
                        </Button>
                    </div>
                )}

                {/* Orbit Agent Status Banner */}
                {!isLoading && agentStatus !== undefined && (
                    <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border text-sm font-medium transition-all ${agentStatus.online
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                            : 'bg-muted/30 border-border text-muted-foreground'
                        }`}>
                        <div className={`p-2 rounded-lg ${agentStatus.online ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                            <Satellite className={`w-4 h-4 ${agentStatus.online ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                            {agentStatus.online ? (
                                <>
                                    <span className="font-bold">Orbit Agent SDK Online</span>
                                    <span className="text-emerald-400/70 ml-2">
                                        — {agentStatus.count} agent{agentStatus.count !== 1 ? 's' : ''} conectado{agentStatus.count !== 1 ? 's' : ''}
                                        {agentOnlineCount > 0 && ` (${agentOnlineCount} servidor${agentOnlineCount !== 1 ? 'es' : ''})`}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="font-bold">Nenhum Orbit Agent conectado</span>
                                    <span className="text-muted-foreground/70 ml-2">— Instale o SDK no servidor para habilitar execução remota</span>
                                </>
                            )}
                        </div>
                        {!agentStatus.online && (
                            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.info('Na próxima sessão veremos como instalar o Orbit Agent no seu servidor VPS.')}>
                                <Terminal className="w-3.5 h-3.5" />
                                Como instalar
                            </Button>
                        )}
                    </div>
                )}

                {/* Search + Filter */}
                <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou Guild ID..."
                            className="pl-10"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="w-full md:w-auto gap-2" onClick={() => toast.info("Em breve: Filtros avançados", { description: "Recurso em desenvolvimento." })}>
                        <Filter className="w-4 h-4" />
                        Filtros
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[280px]">Servidor</TableHead>
                                <TableHead>Dono</TableHead>
                                <TableHead>Membros</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Bot</TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-1.5">
                                        <Satellite className="w-3.5 h-3.5 text-muted-foreground" />
                                        Orbit Agent
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeleton rows={5} cols={7} />
                            ) : filteredServers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                        {search ? `Nenhum resultado para "${search}".` : 'Nenhum servidor vinculado. Clique em "Adicionar Servidor" para começar.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredServers.map((server) => {
                                    const agentConnected = connectedAgents.has(server.discordGuildId || server.id);
                                    return (
                                        <TableRow key={server.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-border">
                                                        <AvatarImage src={server.icon || undefined} alt={server.name} />
                                                        <AvatarFallback>{server.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold group-hover:text-primary transition-colors">{server.name}</p>
                                                        <p className="text-[11px] font-mono text-muted-foreground">{server.discordGuildId}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground truncate max-w-[120px]">
                                                {server.ownerName || "Você"}
                                            </TableCell>
                                            <TableCell>{(server.memberCount || 0).toLocaleString("pt-BR")}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={planBadgeClass(server.plan || "FREE")}>
                                                    {server.plan || "FREE"}
                                                </Badge>
                                            </TableCell>
                                            {/* Bot Status */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${server.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                                                    <span className="text-sm">{server.isActive ? "Online" : "Offline"}</span>
                                                </div>
                                            </TableCell>
                                            {/* Orbit Agent Status */}
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-2 cursor-default">
                                                            {agentConnected ? (
                                                                <>
                                                                    <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                                                                    <span className="text-sm text-sky-400 font-medium">Conectado</span>
                                                                    <Wifi className="w-3.5 h-3.5 text-sky-400/60" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                                                    <span className="text-sm text-muted-foreground">Offline</span>
                                                                    <WifiOff className="w-3.5 h-3.5 text-muted-foreground/40" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        {agentConnected
                                                            ? `Orbit Agent V2 ativo — Execução remota disponível para Guild ${server.discordGuildId}`
                                                            : 'Nenhum Orbit Agent conectado. Instale o SDK no servidor para habilitar execução remota.'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-xs"
                                                        onClick={() => setConfigServer(server)}
                                                    >
                                                        <Settings2 className="w-3.5 h-3.5" />
                                                        Configurar
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => toast.info("Em breve: Painel de detalhes avançados do Servidor")}>
                                                                Ver detalhes
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => window.location.href = '/dashboard/staff'}>
                                                                Gerenciar staff
                                                            </DropdownMenuItem>
                                                            {agentConnected && (
                                                                <DropdownMenuItem onClick={() => toast.info(`Agent conectado no Guild ${server.discordGuildId}. Execução remota disponível.`)}>
                                                                    <Satellite className="w-3.5 h-3.5 mr-2 text-sky-400" />
                                                                    Ver status do Agent
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDelete(server.id, server.name)}
                                                            >
                                                                Remover servidor
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </TooltipProvider>
    );
}
