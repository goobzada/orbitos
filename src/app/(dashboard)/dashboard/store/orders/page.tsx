"use client";

import { useOrganizations, useStoreOrders } from "@/lib/hooks";
import { PackageOpen, Filter, ArrowDownToLine, Receipt, Search, CreditCard, CheckCircle2, Clock, AlertTriangle, ExternalLink, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { useActiveOrg } from "@/lib/use-org-store";

export default function StoreOrdersPage() {
    const { activeOrgId } = useActiveOrg();
    const { data: orgs } = useOrganizations();
    const org = orgs?.find(o => o.id === activeOrgId);
    const isFree = org?.plan === 'FREE';

    const { data: orders, isLoading } = useStoreOrders(activeOrgId || "");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOrders = orders?.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.externalCustomerId?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"><CheckCircle2 className="w-3 h-3" /> Pago</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1"><Clock className="w-3 h-3" /> Pendente</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getDeliveryBadge = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Entregue</Badge>;
            case 'READY':
                return <Badge variant="outline" className="text-blue-500 border-blue-500/30 font-bold animate-pulse">Processando</Badge>;
            case 'FAILED':
                return <Badge variant="outline" className="text-destructive border-destructive/30">Falha</Badge>;
            default:
                return <Badge variant="outline" className="text-muted-foreground border-border/50">Aguardando</Badge>;
        }
    };

    if (isFree) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 fade-in pb-12">
                <div className="p-16 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md shadow-2xl text-center flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                        <Receipt className="w-10 h-10 text-violet-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Histórico Bloqueado</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto shadow-sm">
                            O rastreio de transações e a gestão de pedidos automáticos estão reservados para o plano <span className="text-violet-500 font-bold tracking-widest text-sm uppercase">Pro</span> ou <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">Max</span>.
                        </p>
                    </div>
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white font-black h-12 px-8 rounded-xl shadow-lg shadow-violet-500/20">
                        Upgrade Agora
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs uppercase tracking-widest mb-2">
                        <CreditCard className="w-4 h-4" />
                        Fluxo de Caixa
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Pedidos da Loja</h1>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                        Monitore transações em tempo real e verifique o status da entrega automática nos servidores.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 bg-card border-border rounded-xl h-11 px-5 hover:bg-muted font-bold">
                        <Filter className="w-4 h-4" /> Filtros
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-emerald-500/20 gap-2">
                        <ArrowDownToLine className="w-4 h-4" /> Exportar Relatório
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 bg-card/40 border border-border/50 p-2 rounded-2xl backdrop-blur-sm max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="ID, email ou ID Externo..."
                            className="pl-9 bg-transparent border-none focus-visible:ring-0 shadow-none h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-md overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground animate-pulse">Buscando transações recentes...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                                <PackageOpen className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Nenhum pedido processado</h3>
                                <p className="text-muted-foreground max-w-sm">Assim que os membros comprarem VIPs e produtos, as transações aparecerão aqui em tempo real.</p>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-tighter text-[11px] text-foreground">Pedido / Cliente</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-tighter text-[11px] text-foreground">Valor Bruto</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-tighter text-[11px] text-foreground">Pagamento</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-tighter text-[11px] text-foreground">Status Entrega</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-tighter text-[11px] text-right text-foreground">Horário</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/10 border-border/50 group transition-colors">
                                        <TableCell className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <User className="w-5 h-5 text-violet-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground flex items-center gap-1.5">
                                                        #{order.id.slice(-6).toUpperCase()}
                                                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{order.customerEmail || order.externalCustomerId || "Visitante"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 px-6 font-black text-foreground">
                                            {(order.totalCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                        <TableCell className="py-5 px-6">
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell className="py-5 px-6">
                                            {getDeliveryBadge(order.items?.[0]?.deliveryStatus || 'PENDING')}
                                        </TableCell>
                                        <TableCell className="py-5 px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-bold text-foreground">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                                                <span className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}

