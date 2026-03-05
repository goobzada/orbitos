'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlatformInvoices } from "@/lib/hooks";

const statusColors: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    void: "bg-muted text-muted-foreground border-border",
    uncollectible: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const formatCents = (cents: number, currency: string = 'brl') =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: currency.toUpperCase() });

export default function PlatformInvoicesPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const limit = 20;

    const { data, isLoading } = usePlatformInvoices({
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
                <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
                <p className="text-muted-foreground">Lista de todas as faturas geradas pela plataforma via Stripe.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por organização ou número..."
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
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="open">Em Aberto</SelectItem>
                        <SelectItem value="void">Anulado</SelectItem>
                        <SelectItem value="uncollectible">Irrecuperável</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="bg-card/30 backdrop-blur-xl border-amber-500/10 overflow-hidden rounded-2xl">
                <Table>
                    <TableHeader className="bg-muted/40 border-b border-white/5">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Fatura</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Organização</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Status</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Valor</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Data</TableHead>
                            <TableHead className="py-4 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter text-right">Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground animate-pulse">
                                    Carregando faturas...
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground italic">
                                    Nenhuma fatura encontrada.
                                </TableCell>
                            </TableRow>
                        ) : items.map((item: any) => (
                            <TableRow key={item.id} className="hover:bg-amber-500/5 border-b border-white/5 last:border-0">
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-mono text-xs">{item.number || item.id?.slice(0, 14)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm">
                                    {item.orgName || <span className="text-muted-foreground italic">—</span>}
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    {item.status ? (
                                        <Badge className={cn("text-[10px] border", statusColors[item.status] || "bg-muted")}>
                                            {item.status}
                                        </Badge>
                                    ) : '—'}
                                </TableCell>
                                <TableCell className="py-4 px-6 font-mono text-sm">
                                    <div>{formatCents(item.amountDue, item.currency)}</div>
                                    {item.amountPaid !== item.amountDue && (
                                        <div className="text-xs text-emerald-400">Pago: {formatCents(item.amountPaid, item.currency)}</div>
                                    )}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-muted-foreground">
                                    {item.created ? new Date(item.created).toLocaleDateString('pt-BR') : '—'}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                    {item.hostedInvoiceUrl ? (
                                        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                                            <a href={item.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Ver
                                            </a>
                                        </Button>
                                    ) : '—'}
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
