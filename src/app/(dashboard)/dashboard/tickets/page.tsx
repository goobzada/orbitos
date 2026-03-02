'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Filter, MessageSquare, History, Clock, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/skeletons";

import { Ticket } from "@/types";
import { useTickets, useDeleteTicket } from "@/lib/hooks";
import { toast } from "sonner";

const MOCK_TICKETS: any[] = [
    { id: "TK-1042", subject: "Ajuda com pagamento via Pix", authorName: "Kaiky", authorId: "1", server: { name: "Gamer Haven", icon: null }, priority: "HIGH", status: "OPEN", updatedAt: "10 min atrás" },
    { id: "TK-1041", subject: "Reportar Bug no sistema VIP", authorName: "Zeca", authorId: "2", server: { name: "OrbitOS HQ", icon: null }, priority: "MEDIUM", status: "IN_PROGRESS", updatedAt: "1 hora atrás" },
    { id: "TK-1040", subject: "Dúvida sobre permissões", authorName: "Lara", authorId: "3", server: { name: "Tech Hub", icon: null }, priority: "LOW", status: "CLOSED", updatedAt: "5 horas atrás" },
    { id: "TK-1039", subject: "Reembolso compra acidental", authorName: "Bruno", authorId: "4", server: { name: "Gamer Haven", icon: null }, priority: "URGENT", status: "RESOLVED", updatedAt: "Ontem" },
];

export default function TicketsPage() {
    const { data: apiTickets, isLoading } = useTickets();
    const deleteTicket = useDeleteTicket();
    const tickets = process.env.NODE_ENV === "development"
        ? (apiTickets && apiTickets.length > 0 ? apiTickets : MOCK_TICKETS)
        : (apiTickets || []);

    const handleDelete = async (e: React.MouseEvent, ticketId: string) => {
        e.stopPropagation();
        if (!confirm("Deseja realmente deletar este ticket? Esta ação é irreversível.")) return;
        try {
            await deleteTicket.mutateAsync(ticketId);
            toast.success("Ticket deletado com sucesso.");
        } catch {
            toast.error("Erro ao deletar ticket.");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <TableSkeleton rows={10} cols={7} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl border bg-card/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tempo Médio</p>
                        <p className="text-xl font-bold">14 min</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl border bg-card/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Resolvidos (24h)</p>
                        <p className="text-xl font-bold">128</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl border bg-card/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <History className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Média de Feedback</p>
                        <p className="text-xl font-bold">4.8/5.0</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por assunto, usuário ou ID..." className="pl-10" />
                </div>
                <Button variant="outline" className="w-full md:w-auto gap-2" onClick={() => {
                    import('sonner').then(m => m.toast.info("Em breve: Filtro avançado de tickets"));
                }}>
                    <Filter className="w-4 h-4" />
                    Filtros
                </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">ID</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Servidor</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Última Att</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    Nenhum ticket encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50 transition-colors group">
                                    <TableCell className="font-mono text-[10px] font-semibold opacity-50">{ticket.id.split('-')[0]}</TableCell>
                                    <TableCell className="font-medium max-w-[240px]">
                                        <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:text-violet-400 transition-colors block">
                                            <span className="block truncate">{ticket.subject || "Suporte Geral"}</span>
                                            {ticket.formData && (() => {
                                                try {
                                                    const fd = typeof ticket.formData === 'string' ? JSON.parse(ticket.formData) : ticket.formData;
                                                    const motivo = fd?.motivo || fd?.reason || fd?.Motivo || Object.values(fd)[0];
                                                    if (motivo) return <span className="text-[10px] text-muted-foreground block truncate italic">{String(motivo)}</span>;
                                                } catch { return null; }
                                            })()}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={`https://avatar.vercel.sh/${ticket.authorId}`} />
                                                <AvatarFallback>{(ticket.authorId || "U")[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">@{ticket.authorId}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {typeof ticket.server === 'string' ? ticket.server : ticket.server?.name || 'Desconhecido'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${['HIGH', 'URGENT', 'CRITICAL', 'Alta'].includes(ticket.priority) ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                            ['MEDIUM', 'Média'].includes(ticket.priority) ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            }`}>
                                            {ticket.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.status === "OPEN" || ticket.status === "Aberto" ? "destructive" : "secondary"}>
                                            {ticket.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">
                                        <div className="flex items-center justify-end gap-2">
                                            <span>{new Date(ticket.updatedAt || "").toLocaleDateString()}</span>
                                            <Link href={`/dashboard/tickets/${ticket.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                            disabled={deleteTicket.isPending}
                                            onClick={(e) => handleDelete(e, ticket.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
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
