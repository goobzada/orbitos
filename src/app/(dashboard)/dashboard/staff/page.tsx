'use client';

import { useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, MoreHorizontal, History, Shield, AlertCircle } from "lucide-react";
import {
    useStaffMembers,
    useServers,
    useRemoveStaffMember,
    useUpdateStaffMember
} from "@/lib/hooks";
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";
import { StaffMember } from "@/types";
import { AddStaffModal } from "@/components/modals/add-staff-modal";
import { StaffHistoryModal } from "@/components/modals/staff-history-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const MOCK_STAFF: StaffMember[] = [
    { id: "1", serverId: "1", discordId: "111", username: "antonio_silva", avatar: "https://avatar.vercel.sh/antonio", role: "ADMIN", joinedAt: "10 Jan 2025", lastActive: "Agora", ticketsResolved: 312, punishments: 89, avgResponseTime: "8 min" },
    { id: "2", serverId: "1", discordId: "222", username: "bia_games", avatar: "https://avatar.vercel.sh/bia", role: "MOD", joinedAt: "05 Fev 2025", lastActive: "há 2 horas", ticketsResolved: 145, punishments: 23, avgResponseTime: "12 min" },
    { id: "3", serverId: "2", discordId: "333", username: "carlos_dev", avatar: "https://avatar.vercel.sh/carlos", role: "OWNER", joinedAt: "01 Jan 2025", lastActive: "Ontem", ticketsResolved: 45, punishments: 5, avgResponseTime: "25 min" },
    { id: "4", serverId: "1", discordId: "444", username: "dani_mod", avatar: "https://avatar.vercel.sh/dani", role: "HELPER", joinedAt: "15 Fev 2026", lastActive: "Agora", ticketsResolved: 12, punishments: 0, avgResponseTime: "5 min" },
];


const roleColors: Record<string, string> = {
    OWNER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
    MOD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    HELPER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function StaffPage() {
    const { data: apiStaff, isLoading, isError } = useStaffMembers();
    const { data: apiServers = [] } = useServers();
    const removeStaff = useRemoveStaffMember();
    const updateStaff = useUpdateStaffMember();

    const staffList = apiStaff || [];
    const serverOptions = [{ id: "all", name: "Todos os servidores" }, ...apiServers];

    const [addOpen, setAddOpen] = useState(false);
    const [historyStaff, setHistoryStaff] = useState<StaffMember | null>(null);
    const [serverFilter, setServerFilter] = useState("all");

    const handleRemove = async (id: string, username: string) => {
        if (!confirm(`Remover @${username} da equipe?`)) return;
        try {
            await removeStaff.mutateAsync(id);
            toast.success("Membro removido com sucesso");
        } catch (error) {
            toast.error("Erro ao remover membro");
        }
    };

    const handleUpdateRole = async (staffId: string, role: string) => {
        try {
            await updateStaff.mutateAsync({ staffId, role });
            toast.success("Função atualizada!");
        } catch (error) {
            toast.error("Erro ao atualizar função");
        }
    };

    const filteredStaff = serverFilter === "all"
        ? staffList
        : staffList.filter(s => s.serverId === serverFilter);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Modals */}
            <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} />
            <StaffHistoryModal
                open={!!historyStaff}
                onClose={() => setHistoryStaff(null)}
                staffMember={historyStaff}
            />

            {/* Header */}
            {isLoading ? <PageHeaderSkeleton /> : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h1>
                        <p className="text-muted-foreground">
                            Gerencie roles, permissões e análise de desempenho da sua equipe.
                        </p>
                    </div>
                    <Button className="w-full md:w-auto gap-2" onClick={() => setAddOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Adicionar Membro
                    </Button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por usuário..." className="pl-10" />
                </div>
                <div className="w-full md:w-[250px]">
                    <Select value={serverFilter} onValueChange={setServerFilter}>
                        <SelectTrigger className="bg-secondary/30">
                            <SelectValue placeholder="Servidor" />
                        </SelectTrigger>
                        <SelectContent>
                            {serverOptions.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[280px]">Usuário</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead className="text-center">Resoluções</TableHead>
                            <TableHead className="text-center font-medium">Punições</TableHead>
                            <TableHead>Último Acesso</TableHead>
                            <TableHead className="text-right pr-6">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton rows={5} cols={6} />
                        ) : filteredStaff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                    Ninguém na equipe para este filtro.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStaff.map((member) => (
                                <TableRow key={member.id} className="group hover:bg-muted/20 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3 pl-2">
                                            <Avatar className="h-9 w-9 border border-border shadow-sm">
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.username[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">
                                                    @{member.username}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">ID: {member.discordId}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("font-bold text-[10px] tracking-wider", roleColors[member.role] || "bg-secondary text-secondary-foreground")}>
                                            {member.role === "OWNER" && <Shield className="w-2.5 h-2.5 mr-1" />}
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-sm">
                                        {member.ticketsResolved?.toLocaleString() || 0}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-sm text-rose-400">
                                        {member.punishments?.toLocaleString() || 0}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {member.lastActive === "Agora" ? (
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            ) : null}
                                            <span className="text-xs text-muted-foreground">{member.lastActive}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-all md:opacity-0 group-hover:opacity-100"
                                                onClick={() => setHistoryStaff(member)}
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                Histórico
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/50">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bordet-b">Ações de Staff</div>
                                                    <DropdownMenuItem className="text-xs" disabled>Pausar acessos (PRO)</DropdownMenuItem>
                                                    <div className="h-px bg-muted mx-1 my-1" />
                                                    <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground">Alterar Cargo</div>
                                                    {Object.keys(roleColors).filter(r => r !== member.role).map(role => (
                                                        <DropdownMenuItem
                                                            key={role}
                                                            className="text-xs pl-4"
                                                            onClick={() => handleUpdateRole(member.id, role)}
                                                        >
                                                            Mudar para {role}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <div className="h-px bg-muted mx-1 my-1" />
                                                    <DropdownMenuItem
                                                        className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => handleRemove(member.id, member.username)}
                                                    >
                                                        Remover da Equipe
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
