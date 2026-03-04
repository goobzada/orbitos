'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft, Clock, Send, User, Tag, Server,
    CheckCircle2, AlertCircle, XCircle, Loader2,
    MoreHorizontal, Paperclip, ChevronDown, Trash2, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTicket, useSendTicketMessage, useCloseTicket, useDeleteTicket, useUpdateTicketStatus, useUpdateTicketPriority, useAssignTicketStaff, useStaffMembers } from "@/lib/hooks";

const statusConfig = {
    OPEN: { label: "Aberto", icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    IN_PROGRESS: { label: "Em Progresso", icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    PENDING: { label: "Aguardando", icon: Clock, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
    CLOSED: { label: "Fechado", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    RESOLVED: { label: "Resolvido", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

const priorityConfig = {
    LOW: { label: "Baixa", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    MEDIUM: { label: "Média", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    HIGH: { label: "Alta", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    URGENT: { label: "Urgente", color: "bg-red-600/10 text-red-400 border-red-600/20" },
    CRITICAL: { label: "Crítica", color: "bg-fuchsia-600/10 text-fuchsia-400 border-fuchsia-600/20" },
};

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [reply, setReply] = useState("");

    const ticketId = params.id as string;
    const { data: ticket, isLoading, isError } = useTicket(ticketId);
    const { mutateAsync: sendMessage, isPending: sending } = useSendTicketMessage(ticketId);
    const { mutateAsync: closeTicket } = useCloseTicket();
    const { mutateAsync: deleteTicket, isPending: deleting } = useDeleteTicket();
    const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateTicketStatus(ticketId);
    const { mutateAsync: updatePriority, isPending: updatingPriority } = useUpdateTicketPriority(ticketId);
    const { mutateAsync: assignStaff, isPending: assigningStaff } = useAssignTicketStaff(ticketId);
    const { data: staffMembers } = useStaffMembers(ticket?.serverId);
    const confirm = useConfirm();

    const handleDeleteTicket = async () => {
        const ok = await confirm({
            title: 'Deletar Ticket',
            description: 'Esta ação é irreversível. O ticket e todas as mensagens serão removidos permanentemente.',
            confirmLabel: 'Deletar',
            cancelLabel: 'Cancelar',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await deleteTicket(ticketId);
            toast.success("Ticket deletado.");
            router.push('/dashboard/tickets');
        } catch {
            toast.error("Erro ao deletar ticket.");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (isError || !ticket) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <XCircle className="w-12 h-12 text-rose-500 opacity-20" />
                <p className="text-muted-foreground">Ticket não encontrado ou erro na conexão.</p>
                <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
            </div>
        );
    }

    const messages = ticket.messages || [];
    const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.OPEN;
    const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    const StatusIcon = statusInfo.icon;

    const handleSend = async () => {
        if (!reply.trim()) return;
        try {
            await sendMessage(reply);
            setReply("");
            toast.success("Resposta enviada!");
        } catch (e) {
            toast.error("Erro ao enviar mensagem. Tente novamente.");
        }
    };

    const handleClose = async () => {
        const ok = await confirm({
            title: 'Fechar Ticket',
            description: 'O ticket será fechado e o canal no Discord será excluído em 10 segundos.',
            confirmLabel: 'Fechar Ticket',
            cancelLabel: 'Cancelar',
            variant: 'warning',
        });
        if (!ok) return;
        try {
            await closeTicket(ticketId);
            toast.success("Ticket fechado com sucesso.");
            router.push('/dashboard/tickets');
        } catch (e) {
            toast.error("Erro ao fechar ticket.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back + Title */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5 shrink-0" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        <Badge variant="outline" className={cn("text-xs font-bold uppercase px-2 py-0.5", priorityInfo.color)}>
                            {priorityInfo.label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs font-medium px-2 py-0.5", statusInfo.bg, statusInfo.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mt-1 leading-tight">{ticket.subject}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-slate-950 border-slate-800">
                            <DropdownMenuLabel>Ações do Ticket</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem className="gap-2 text-rose-400 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer" onClick={handleClose}>
                                <CheckCircle2 className="w-4 h-4" />
                                Fechar Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-slate-400 focus:text-slate-300 focus:bg-slate-800 cursor-pointer" onClick={() => toast.info("Em breve: Exportar Log")}>
                                <ExternalLink className="w-4 h-4" />
                                Exportar PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem
                                className="gap-2 text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                                disabled={deleting}
                                onClick={handleDeleteTicket}
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting ? "Deletando..." : "Deletar Ticket"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Message thread */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Messages */}
                    <Card className="shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            {messages.map((msg, i) => {
                                const isStaff = msg.isStaff;
                                return (
                                    <div key={msg.id}>
                                        {i > 0 && <Separator className="my-6" />}
                                        <div className={cn("flex gap-3", isStaff && "flex-row-reverse")}>
                                            <Avatar className="h-9 w-9 shrink-0 border">
                                                <AvatarImage src={msg.authorAvatar || undefined} />
                                                <AvatarFallback>{(msg.authorName || "?")[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className={cn("flex flex-col gap-1 min-w-0 flex-1", isStaff && "items-end")}>
                                                <div className={cn("flex items-center gap-2", isStaff && "flex-row-reverse")}>
                                                    <span className="text-sm font-semibold">@{msg.authorName || "usuário"}</span>
                                                    {isStaff && (
                                                        <Badge className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20 h-4 px-1.5">
                                                            Staff
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <div className={cn(
                                                    "rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[85%]",
                                                    isStaff
                                                        ? "bg-violet-500/10 border border-violet-500/20 text-foreground"
                                                        : "bg-secondary border border-border text-foreground"
                                                )}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Reply box */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Responder</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Escreva sua resposta... (Enter para enviar)"
                                className="w-full min-h-[100px] rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-muted-foreground elegant-scrollbar"
                            />
                            <div className="flex items-center justify-between">
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => toast.info("Em breve: Upload de anexos em tickets")}>
                                    <Paperclip className="w-4 h-4" />
                                    Anexar
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                                    onClick={handleSend}
                                    disabled={sending || !reply.trim()}
                                >
                                    {sending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {sending ? "Enviando..." : "Enviar Resposta"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar info */}
                <div className="flex flex-col gap-4">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Informações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InfoRow icon={User} label="Aberto por" value={`@${ticket.authorId}`} />
                            <InfoRow icon={Server} label="Servidor" value={ticket.server?.name || "Desconhecido"} />
                            <Separator />
                            <InfoRow icon={Clock} label="Criado em" value={new Date(ticket.createdAt).toLocaleString()} />
                            <InfoRow icon={Clock} label="Atualizado em" value={new Date(ticket.updatedAt).toLocaleString()} />
                            <Separator />
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    Tags
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(ticket.tags || ["suporte"]).map((tag) => (
                                        <span key={tag} className="text-xs bg-secondary border border-border rounded-full px-2.5 py-0.5 text-muted-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Motivo / Formulário preenchido pelo usuário */}
                    {ticket.formData && (() => {
                        try {
                            const fd = typeof ticket.formData === 'string' ? JSON.parse(ticket.formData) : ticket.formData;
                            const entries = Object.entries(fd as Record<string, string>);
                            if (entries.length === 0) return null;
                            return (
                                <Card className="shadow-sm border-violet-500/20 bg-violet-500/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                            Motivo do Ticket
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {entries.map(([campo, valor]) => (
                                            <div key={campo}>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{campo}</p>
                                                <p className="text-sm text-foreground bg-background/50 rounded-md px-3 py-2 border border-border/50 leading-relaxed">{String(valor)}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        } catch { return null; }
                    })()}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Alterar Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {Object.entries(statusConfig).map(([key, val]) => (
                                <Button
                                    key={key}
                                    variant="ghost"
                                    size="sm"
                                    disabled={ticket.status === key || updatingStatus}
                                    className={cn(
                                        "w-full justify-start gap-2 h-8",
                                        ticket.status === key && val.bg + " " + val.color
                                    )}
                                    onClick={async () => {
                                        if (ticket.status !== key) {
                                            try {
                                                await updateStatus(key);
                                                toast.success(`Status alterado para ${val.label}`);
                                            } catch (e) {
                                                toast.error("Erro ao alterar status.");
                                            }
                                        }
                                    }}
                                >
                                    {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <val.icon className="w-3.5 h-3.5" />}
                                    {val.label}
                                    {ticket.status === key && <span className="ml-auto text-[10px] opacity-60">atual</span>}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Alterar Prioridade</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {Object.entries(priorityConfig).map(([key, val]) => (
                                <Button
                                    key={key}
                                    variant="ghost"
                                    size="sm"
                                    disabled={ticket.priority === key || updatingPriority}
                                    className={cn(
                                        "w-full justify-start gap-2 h-8",
                                        ticket.priority === key && "bg-secondary text-foreground"
                                    )}
                                    onClick={async () => {
                                        if (ticket.priority !== key) {
                                            try {
                                                await updatePriority(key);
                                                toast.success(`Prioridade alterada para ${val.label}`);
                                            } catch (e) {
                                                toast.error("Erro ao alterar prioridade.");
                                            }
                                        }
                                    }}
                                >
                                    {updatingPriority ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <div className={cn("w-2 h-2 rounded-full", val.color.split(' ')[0])} />}
                                    {val.label}
                                    {ticket.priority === key && <span className="ml-auto text-[10px] opacity-60">atual</span>}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Atribuir a Staff</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Select
                                value={ticket.assignedStaffId || "none"}
                                onValueChange={async (val) => {
                                    const staffId = val === "none" ? null : val;
                                    try {
                                        await assignStaff(staffId);
                                        toast.success("Responsável atualizado.");
                                    } catch (e) {
                                        toast.error("Erro ao atribuir staff.");
                                    }
                                }}
                                disabled={assigningStaff}
                            >
                                <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-300">
                                    <SelectValue placeholder="Não atribuído" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                                    <SelectItem value="none">Não atribuído</SelectItem>
                                    {staffMembers?.map((staff: any) => (
                                        <SelectItem key={staff.id} value={staff.id}>
                                            {staff.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    avatar,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    avatar?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </span>
            <span className="text-xs font-medium flex items-center gap-1.5 text-right">
                {avatar && (
                    <Avatar className="h-4 w-4">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{value[0]}</AvatarFallback>
                    </Avatar>
                )}
                {value}
            </span>
        </div>
    );
}
