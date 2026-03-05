'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink, FileText, CreditCard, AlertTriangle, Pause, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    usePlatformTenantBilling,
    useChangeTenantPlan,
    useCancelTenantSubscription,
    usePauseTenantSubscription,
} from "@/lib/hooks";

const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    trialing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    past_due: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    canceled: "bg-muted text-muted-foreground border-border",
    unpaid: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const formatCents = (cents: number, currency: string = 'brl') =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: currency.toUpperCase() });

export default function TenantBillingDetailPage() {
    const params = useParams<{ orgId: string }>();
    const orgId = params.orgId;
    const router = useRouter();

    const [newPriceId, setNewPriceId] = useState('');
    const [proration, setProration] = useState(true);

    const { data, isLoading, refetch } = usePlatformTenantBilling(orgId);
    const changePlan = useChangeTenantPlan();
    const cancelSub = useCancelTenantSubscription();
    const pauseSub = usePauseTenantSubscription();

    const org = data?.org;
    const invoices: any[] = data?.invoices || [];

    const handleChangePlan = async () => {
        if (!newPriceId.trim()) {
            toast.error('Informe o Price ID do novo plano.');
            return;
        }
        if (!confirm(`Alterar plano para Price ID: ${newPriceId}?`)) return;
        try {
            await changePlan.mutateAsync({ orgId, priceId: newPriceId.trim(), proration });
            toast.success('Plano alterado com sucesso!');
            setNewPriceId('');
            refetch();
        } catch (e: any) {
            toast.error(e?.response?.data?.error || 'Erro ao alterar plano.');
        }
    };

    const handleCancel = async (atPeriodEnd: boolean) => {
        const msg = atPeriodEnd
            ? 'Cancelar ao fim do período atual?'
            : 'Cancelar IMEDIATAMENTE a assinatura? Esta ação é irreversível.';
        if (!confirm(msg)) return;
        try {
            await cancelSub.mutateAsync({ orgId, atPeriodEnd });
            toast.success(atPeriodEnd ? 'Assinatura marcada para cancelamento ao fim do período.' : 'Assinatura cancelada imediatamente.');
            refetch();
        } catch (e: any) {
            toast.error(e?.response?.data?.error || 'Erro ao cancelar assinatura.');
        }
    };

    const handlePause = async () => {
        if (!confirm('Pausar cobranças desta assinatura?')) return;
        try {
            await pauseSub.mutateAsync(orgId);
            toast.success('Cobranças pausadas.');
            refetch();
        } catch (e: any) {
            toast.error(e?.response?.data?.error || 'Erro ao pausar assinatura.');
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center animate-pulse">Carregando dados de billing...</div>;
    }

    if (!org) {
        return (
            <div className="p-10 text-center text-muted-foreground">
                Organização não encontrada.{' '}
                <Button variant="link" onClick={() => router.back()}>Voltar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                    <Link href="/platform/billing/subscriptions">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
                    <p className="text-sm text-muted-foreground">{org.ownerEmail || org.ownerUsername || org.id}</p>
                </div>
            </div>

            {/* Billing Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Plano Atual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{org.plan}</div>
                        {org.planPriceId && (
                            <div className="text-xs text-muted-foreground font-mono mt-1">{org.planPriceId}</div>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status Stripe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {org.subscriptionStatus ? (
                            <Badge className={cn("text-sm border", statusColors[org.subscriptionStatus] || "bg-muted")}>
                                {org.subscriptionStatus}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground text-sm">Sem assinatura</span>
                        )}
                        {org.cancelAtPeriodEnd && (
                            <div className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Cancela ao fim do período
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Próxima Cobrança</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {org.currentPeriodEnd
                                ? new Date(org.currentPeriodEnd).toLocaleDateString('pt-BR')
                                : '—'}
                        </div>
                        {org.lastInvoiceStatus && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Última fatura: <Badge className={cn("text-[10px] border ml-1", statusColors[org.lastInvoiceStatus] || "bg-muted")}>{org.lastInvoiceStatus}</Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Stripe IDs */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        IDs Stripe
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-mono">
                    <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-40">Customer ID</span>
                        <span>{org.stripeCustomerId || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-40">Subscription ID</span>
                        <span>{org.stripeSubscriptionId || '—'}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            {org.stripeSubscriptionId && (
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20">
                    <CardHeader>
                        <CardTitle className="text-base">Ações de Controle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Change Plan */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Alterar Plano (Stripe Price ID)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="price_..."
                                    value={newPriceId}
                                    onChange={(e) => setNewPriceId(e.target.value)}
                                    className="font-mono"
                                />
                                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={proration}
                                        onChange={(e) => setProration(e.target.checked)}
                                        className="rounded"
                                    />
                                    Proratar
                                </label>
                                <Button
                                    onClick={handleChangePlan}
                                    disabled={changePlan.isPending}
                                    className="bg-violet-600 hover:bg-violet-700 whitespace-nowrap"
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>

                        {/* Cancel / Pause */}
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                className="gap-2 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10"
                                onClick={handlePause}
                                disabled={pauseSub.isPending}
                            >
                                <Pause className="w-4 h-4" />
                                Pausar Cobranças
                            </Button>
                            <Button
                                variant="outline"
                                className="gap-2 text-orange-400 border-orange-500/20 hover:bg-orange-500/10"
                                onClick={() => handleCancel(true)}
                                disabled={cancelSub.isPending}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Cancelar ao Fim do Período
                            </Button>
                            <Button
                                variant="outline"
                                className="gap-2 text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
                                onClick={() => handleCancel(false)}
                                disabled={cancelSub.isPending}
                            >
                                <X className="w-4 h-4" />
                                Cancelar Imediatamente
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Invoice History */}
            <Card className="bg-card/30 backdrop-blur-xl border-amber-500/10 overflow-hidden rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        Histórico de Faturas
                    </CardTitle>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-muted/40 border-b border-white/5">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-3 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Número</TableHead>
                            <TableHead className="py-3 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Status</TableHead>
                            <TableHead className="py-3 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Valor</TableHead>
                            <TableHead className="py-3 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Data</TableHead>
                            <TableHead className="py-3 px-6 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter text-right">Link</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                                    Nenhuma fatura encontrada.
                                </TableCell>
                            </TableRow>
                        ) : invoices.map((inv: any) => (
                            <TableRow key={inv.id} className="hover:bg-amber-500/5 border-b border-white/5 last:border-0">
                                <TableCell className="py-3 px-6 font-mono text-xs">{inv.number || inv.id?.slice(0, 14)}</TableCell>
                                <TableCell className="py-3 px-6">
                                    {inv.status && (
                                        <Badge className={cn("text-[10px] border", statusColors[inv.status] || "bg-muted")}>
                                            {inv.status}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="py-3 px-6 font-mono text-sm">
                                    {formatCents(inv.amountDue, inv.currency)}
                                </TableCell>
                                <TableCell className="py-3 px-6 text-sm text-muted-foreground">
                                    {inv.created ? new Date(inv.created).toLocaleDateString('pt-BR') : '—'}
                                </TableCell>
                                <TableCell className="py-3 px-6 text-right">
                                    {inv.hostedInvoiceUrl ? (
                                        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                                            <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
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
        </div>
    );
}
