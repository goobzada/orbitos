'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePlatformSubscriptions } from "@/lib/hooks";

const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    trialing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    past_due: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    canceled: "bg-muted text-muted-foreground border-border",
    unpaid: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function PlatformSubscriptionsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const limit = 20;

    const { data, isLoading } = usePlatformSubscriptions({
        page,
        limit,
        ...(search ? { search } : {}),
        ...(status && status !== 'all' ? { status } : {}),
    });

    const items: any[] = data?.items || [];
    const total: number = data?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
                <p className="text-muted-foreground">Lista de todas as assinaturas ativas, em trial, atrasadas e canceladas por tenant.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="trialing">Trial</SelectItem>
                        <SelectItem value="past_due">Atrasado</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                        <SelectItem value="unpaid">Não Pago</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="bg-card/30 backdrop-blur-xl border-amber-500/10 overflow-hidden rounded-2xl">
                <Table>
                    <TableHeader className="bg-muted/40 border-b border-white/5">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Organização</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Owner</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Plano</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Status Stripe</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Próx. Cobrança</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground animate-pulse">
                                    Carregando assinaturas...
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground italic">
                                    Nenhuma assinatura encontrada.
                                </TableCell>
                            </TableRow>
                        ) : items.map((item: any) => (
                            <TableRow key={item.orgId} className="hover:bg-amber-500/5 border-b border-white/5 last:border-0">
                                <TableCell className="py-4 px-6">
                                    <div className="font-semibold">{item.orgName}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{item.orgId?.slice(0, 8)}</div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-muted-foreground">
                                    {item.ownerEmail || item.ownerUsername || '—'}
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <Badge variant="outline" className="font-mono text-xs">{item.plan}</Badge>
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    {item.subscriptionStatus ? (
                                        <Badge className={cn("text-[10px] border", statusColors[item.subscriptionStatus] || "bg-muted")}>
                                            {item.subscriptionStatus}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">—</span>
                                    )}
                                    {item.cancelAtPeriodEnd && (
                                        <div className="text-[10px] text-rose-400 mt-1">cancela ao fim do período</div>
                                    )}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-muted-foreground">
                                    {item.currentPeriodEnd
                                        ? new Date(item.currentPeriodEnd).toLocaleDateString('pt-BR')
                                        : '—'}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                    <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                                        <Link href={`/platform/billing/tenants/${item.orgId}`}>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Detalhe
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{total} registros</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span>Página {page} de {totalPages}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
