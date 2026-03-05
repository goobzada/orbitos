'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    CheckCircle2, Zap, Building2, Sparkles,
    CreditCard, Calendar, ArrowUpRight, Download,
    AlertCircle
} from "lucide-react";
import { useOrganizations, useBillingStatus, useCheckoutSession, useCustomerPortal } from "@/lib/hooks";
import { toast } from "sonner";
import { useTranslation } from "@/components/providers/language-provider";

const plans = [
    {
        id: "free",
        name: "Free",
        price: 0,
        description: "Para começar e explorar a plataforma.",
        icon: Zap,
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/20",
        features: [
            "Até 3 servidores",
            "100 tickets/mês",
            "Analytics básico",
            "Suporte por e-mail",
        ],
        limits: { servers: 3, tickets: 100 },
        cta: "Plano atual não",
    },
    {
        id: "pro",
        name: "Pro",
        price: 29,
        description: "Para equipes que precisam de mais poder.",
        icon: Sparkles,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/30",
        badge: "Mais popular",
        features: [
            "Servidores ilimitados",
            "Tickets ilimitados",
            "Analytics avançado",
            "Multi-staff e permissões",
            "Webhooks do Discord",
            "Suporte prioritário",
        ],
        limits: { servers: -1, tickets: -1 },
        cta: "Fazer Upgrade",
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: 99,
        description: "Para grandes operações e corporações.",
        icon: Building2,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        features: [
            "Tudo do Pro",
            "SLA garantido 99.9%",
            "Gerente de conta dedicado",
            "Integrações customizadas",
            "Deploy on-premise",
            "Suporte 24/7",
        ],
        limits: { servers: -1, tickets: -1 },
        cta: "Fazer Upgrade",
    },
    {
        id: "max",
        name: "MAX",
        price: 299,
        description: "Poder total. Para os maiores do setor.",
        icon: Sparkles,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        badge: "🔥 Melhor custo-benefício",
        features: [
            "Tudo do Enterprise",
            "Limite ilimitado em tudo",
            "URL personalizada",
            "Bot engine dedicado",
            "Integrações de IA",
            "Suporte VIP 24/7",
        ],
        limits: { servers: -1, tickets: -1 },
        cta: "Fazer Upgrade",
    },
];

const invoices = [
    { id: "INV-2024-012", date: "01 Fev 2026", amount: "R$ 29,00", status: "Pago", plan: "Pro" },
    { id: "INV-2024-011", date: "01 Jan 2026", amount: "R$ 29,00", status: "Pago", plan: "Pro" },
    { id: "INV-2024-010", date: "01 Dez 2025", amount: "R$ 29,00", status: "Pago", plan: "Pro" },
    { id: "INV-2024-009", date: "01 Nov 2025", amount: "R$ 29,00", status: "Pago", plan: "Pro" },
];

export default function BillingPage() {
    const { t } = useTranslation();
    const { data: organizations } = useOrganizations();
    const activeOrganizationId = typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null;
    const activeOrg = organizations?.find(org => org.id === activeOrganizationId) || organizations?.[0];

    // Local plans array with translations
    const localPlans = [
        {
            ...plans[0],
            name: t.billing.plans.free.name,
            description: t.billing.plans.free.description,
            features: t.billing.plans.free.features,
            cta: t.billing.active_plan
        },
        {
            ...plans[1],
            name: t.billing.plans.pro.name,
            description: t.billing.plans.pro.description,
            features: t.billing.plans.pro.features,
            cta: t.billing.upgrade_cta
        },
        {
            ...plans[2],
            name: t.billing.plans.enterprise.name,
            description: t.billing.plans.enterprise.description,
            features: t.billing.plans.enterprise.features,
            cta: t.billing.upgrade_cta
        },
        {
            ...plans[3],
            name: t.billing.plans.max.name,
            description: t.billing.plans.max.description,
            features: t.billing.plans.max.features,
            cta: t.billing.upgrade_cta
        }
    ];


    // Buscar status de faturamento real
    const { data: billingStatus, isLoading: isBillingLoading } = useBillingStatus(activeOrg?.id || null);
    const checkoutMutation = useCheckoutSession();
    const customerPortalMutation = useCustomerPortal();

    // Normalize plan: handles FREE, PRO, ENTERPRISE, MAX (case-insensitive)
    const rawPlan = (billingStatus?.plan || activeOrg?.plan || 'FREE').toLowerCase();
    const currentPlanId = rawPlan;
    const current = localPlans.find(p => p.id === currentPlanId) || localPlans[0];

    const usageServers = billingStatus?.usage?.servers ?? (activeOrg as any)?._count?.servers ?? 0;
    const usageTickets = billingStatus?.usage?.tickets ?? 0;

    const realInvoices = billingStatus?.invoices?.length > 0 ? billingStatus.invoices : invoices;

    const handleUpgrade = (planId: string) => {
        if (!activeOrg?.id) return;

        toast.loading('Redirecionando para o checkout...', { id: 'checkout' });

        checkoutMutation.mutate({
            organizationId: activeOrg.id,
            planId: planId.toUpperCase()
        }, {
            onSuccess: (data) => {
                toast.success('Redirecionando...', { id: 'checkout' });
                if (data.url) {
                    window.location.href = data.url;
                }
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.error || 'Erro ao iniciar checkout.', { id: 'checkout' });
            }
        });
    };

    const handleCustomerPortal = () => {
        if (!activeOrg?.id) return;
        toast.loading('Abrindo portal do cliente...', { id: 'portal' });

        customerPortalMutation.mutate({ organizationId: activeOrg.id }, {
            onSuccess: (data: any) => {
                toast.success('Redirecionando...', { id: 'portal' });
                if (data.url) window.location.href = data.url;
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.error || 'Erro ao abrir o portal.', { id: 'portal' });
            }
        });
    };

    if (isBillingLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">{t.common.loading}</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.billing.title}</h1>
                <p className="text-muted-foreground mt-1">
                    {t.store.inventory_desc}
                </p>
            </div>

            {/* Current plan summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className={`col-span-2 border-${current.id === 'pro' ? 'violet' : current.id === 'enterprise' ? 'amber' : 'slate'}-500/30 bg-gradient-to-br from-${current.id === 'pro' ? 'violet' : current.id === 'enterprise' ? 'amber' : 'slate'}-500/5 to-transparent`}>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <current.icon className={`w-5 h-5 ${current.color}`} />
                                {t.billing.current_plan} {current.name} — {t.billing.active_plan}
                            </CardTitle>
                            <CardDescription>
                                {current.id === 'free' ? t.billing.plans.free.description : t.billing.manage_subscription}
                            </CardDescription>
                        </div>
                        <Badge className={`bg-${current.id === 'pro' ? 'violet' : current.id === 'enterprise' ? 'amber' : 'slate'}-500/20 text-${current.id === 'pro' ? 'violet' : current.id === 'enterprise' ? 'amber' : 'slate'}-300 border-${current.id === 'pro' ? 'violet' : current.id === 'enterprise' ? 'amber' : 'slate'}-500/30`}>
                            {current.name}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-muted-foreground">Servidores Discord</span>
                                    <span className="font-medium">{usageServers} / {current.limits.servers === -1 ? 'ilimitado' : current.limits.servers}</span>
                                </div>
                                <Progress value={current.limits.servers === -1 ? 100 : Math.min((usageServers / current.limits.servers) * 100, 100)} className="h-1.5" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-muted-foreground">Tickets Abertos (este mês)</span>
                                    <span className="font-medium">{usageTickets} / {current.limits.tickets === -1 ? 'ilimitado' : current.limits.tickets}</span>
                                </div>
                                <Progress value={current.limits.tickets === -1 ? 0 : Math.min((usageTickets / current.limits.tickets) * 100, 100)} className="h-1.5" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-border gap-3 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleCustomerPortal}
                            disabled={customerPortalMutation.isPending || current.id === 'free'}
                        >
                            <CreditCard className="w-4 h-4" />
                            {t.billing.update_card}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                            onClick={handleCustomerPortal}
                            disabled={customerPortalMutation.isPending || current.id === 'free'}
                        >
                            {t.billing.manage_subscription}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Próxima Cobrança</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold">R$ 29,00</span>
                            <span className="text-sm text-muted-foreground">em 01 Mar 2026</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 border border-border">
                            <Calendar className="w-4 h-4 shrink-0" />
                            Ciclo mensal · Cobrança automática
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="w-4 h-4 shrink-0" />
                            Visa •••• 4242
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Plan cards */}
            <div>
                <h2 className="text-xl font-bold mb-4">{t.billing.choose_plan}</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {localPlans.map((plan) => {
                        const isCurrentPlan = plan.id === current.id;
                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col ${isCurrentPlan ? `border-violet-500/50 shadow-lg shadow-violet-500/10` : ""} transition-all hover:-translate-y-0.5`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="pt-6">
                                    <div className={`w-10 h-10 rounded-lg ${plan.bg} flex items-center justify-center mb-2`}>
                                        <plan.icon className={`w-5 h-5 ${plan.color}`} />
                                    </div>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-extrabold">
                                            {plan.price === 0 ? t.billing.plans.free.name : `R$\u00A0${plan.price}`}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-muted-foreground text-sm mb-1">/mês</span>
                                        )}
                                    </div>
                                    <ul className="space-y-2">
                                        {plan.features.map((f: string) => (
                                            <li key={f} className="flex items-start gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-muted-foreground">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button
                                        className={`w-full ${isCurrentPlan ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 cursor-not-allowed" : plan.id === "enterprise" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30" : ""}`}
                                        variant={isCurrentPlan ? "ghost" : "default"}
                                        disabled={isCurrentPlan || checkoutMutation.isPending}
                                        onClick={() => handleUpgrade(plan.id)}
                                    >
                                        {isCurrentPlan ? (
                                            <span className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {t.billing.active_plan}
                                            </span>
                                        ) : checkoutMutation.isPending && checkoutMutation.variables?.planId === plan.id.toUpperCase() ? (
                                            "Redirecionando..."
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <ArrowUpRight className="w-4 h-4" />
                                                {plan.cta}
                                            </span>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Invoice history */}
            <div>
                <h2 className="text-xl font-bold mb-4">{t.billing.invoice_history}</h2>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fatura</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {realInvoices.map((inv: any) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono text-xs font-medium">{inv.id}</TableCell>
                                        <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{inv.plan}</Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{inv.amount}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${inv.status === 'Pago' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {inv.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {inv.pdf ? (
                                                <a href={inv.pdf} target="_blank" rel="noreferrer">
                                                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                                                        <Download className="w-3.5 h-3.5" /> PDF
                                                    </Button>
                                                </a>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs opacity-50" disabled>
                                                    <Download className="w-3.5 h-3.5" /> PDF
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
