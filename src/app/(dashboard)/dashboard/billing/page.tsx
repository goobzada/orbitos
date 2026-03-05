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
import {
    useOrganizations,
    useBillingStatus,
    useCheckoutSession,
    useCustomerPortal,
    useCancelSubscription,
    useReactivateSubscription
} from "@/lib/hooks";
import { toast } from "sonner";
import { useTranslation } from "@/components/providers/language-provider";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();
    const activeOrganizationId = typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null;
    const activeOrg = organizations?.find(org => org.id === activeOrganizationId) || organizations?.[0];

    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');

        if (success === 'true') {
            toast.success(t.billing.success_msg, {
                description: t.billing.success_desc,
                duration: 5000
            });
        }

        if (canceled === 'true') {
            toast.error(t.billing.cancel_msg, {
                description: t.billing.cancel_desc
            });
        }
    }, [searchParams]);

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
    const cancelSubscriptionMutation = useCancelSubscription();
    const reactivateSubscriptionMutation = useReactivateSubscription();

    // Normalize plan: handles FREE, PRO, ENTERPRISE, MAX (case-insensitive)
    const rawPlan = (billingStatus?.plan || activeOrg?.plan || 'FREE').toLowerCase();
    const currentPlanId = rawPlan;
    const current = localPlans.find(p => p.id === currentPlanId) || localPlans[0];

    const usageServers = billingStatus?.usage?.servers ?? (activeOrg as any)?._count?.servers ?? 0;
    const usageTickets = billingStatus?.usage?.tickets ?? 0;

    const realInvoices = billingStatus?.invoices?.length > 0 ? billingStatus.invoices : invoices;

    const handleUpgrade = (planId: string) => {
        if (!activeOrg?.id) return;

        toast.loading(t.billing.checkout_redirect, { id: 'checkout' });

        checkoutMutation.mutate({
            organizationId: activeOrg.id,
            planId: planId.toUpperCase()
        }, {
            onSuccess: (data) => {
                toast.success(t.common.success, { id: 'checkout' });
                if (data.url) {
                    window.location.href = data.url;
                }
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.error || t.common.error, { id: 'checkout' });
            }
        });
    };

    const handleCustomerPortal = () => {
        if (!activeOrg?.id) return;
        toast.loading(t.billing.portal_redirect, { id: 'portal' });

        customerPortalMutation.mutate({ organizationId: activeOrg.id }, {
            onSuccess: (data: any) => {
                toast.success(t.common.success, { id: 'portal' });
                if (data.url) window.location.href = data.url;
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.error || t.common.error, { id: 'portal' });
      

    const handleCancelSubscription = () => {
        if (!activeOrg?.id) return;
        
        if (!confirm('Tem certeza que deseja cancelar sua assinatura? O acesso continuará até o final do período de cobrança.')) {
            return;
        }

        toast.loading('Cancelando assinatura...', { id: 'cancel' });

        cancelSubscriptionMutation.mutate({ organizationId: activeOrg.id }, {
            onSuccess: (data: any) => {
                toast.success('Assinatura cancelada com sucesso', { 
                    id: 'cancel',
                    description: data.message || 'Seu acesso continuará até o final do período de cobrança.'
                });
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.error || 'Erro ao cancelar assinatura', { id: 'cancel' });
            }
        });
    };

    const handleReactivateSubscription = () => {
        if (!activeOrg?.id) return;

        toast.loading('Reativando assinatura...', { id: 'reactivate' });

        reactivateSubscriptionMutation.mutate({ organizationId: activeOrg.id }, {
            onSuccess: (data: any) => {
                toast.success('Assinatura reativada com sucesso', { 
                    id: 'reactivate',
                    description: 'Sua assinatura continuará normalmente.'
                });
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.error || 'Erro ao reativar assinatura', { id: 'reactivate' });
            }
        });
    };      }
        });
    };

    if (isBillingLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">{t.common.loading}</div>;
    }

    const subscription = billingStatus?.subscription;
    const isCanceling = subscription?.cancel_at_period_end;
    const cancelDate = subscription?.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')
        : null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.billing.title}</h1>
                <p className="text-muted-foreground mt-1">
                    {t.billing.plans[currentPlanId].description}
                </p>
            </div>

            {/* Alert when subscription is marked for cancellation */}
            {isCanceling && current.id !== 'free' && (
                <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-5 shadow-lg">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-rose-400">Assinatura Cancelada</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Seu plano será rebaixado para FREE em <strong>{cancelDate}</strong>. Você ainda tem acesso completo até lá.
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleReactivateSubscription} 
                            disabled={reactivateSubscriptionMutation.isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shrink-0"
                        >
                            Reativar Assinatura
                        </Button>
                    </div>
                </div>
            )}

            {/* Dynamic Upsell Banners based on current plan */}
            {!isCanceling && (
                <>
                    {/* FREE → PRO Upsell */}
                    {current.id === 'free' && (
                        <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent p-6 shadow-lg shadow-violet-500/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="w-24 h-24 text-violet-500" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">Mais Popular</Badge>
                                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Economia de 30%</Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold text-violet-400">Desbloqueie Todo o Poder do OrbitOS Pro</h3>
                                    <p className="text-sm text-muted-foreground max-w-2xl">
                                        Servidores ilimitados, analytics avançado, webhooks Discord e suporte prioritário. 
                                        <strong className="text-violet-300"> Economize R$ 12/mês vs planos concorrentes.</strong>
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>Ilimitado</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>Analytics Pro</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>Webhooks</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>Suporte 24h</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Apenas</div>
                                        <div className="text-4xl font-black text-violet-400">R$ 29</div>
                                        <div className="text-sm text-muted-foreground">/mês</div>
                                    </div>
                                    <Button 
                                        size="lg"
                                        className="bg-violet-500 hover:bg-violet-600 text-white font-bold h-12 px-8 shadow-lg shadow-violet-500/20 transition-all hover:scale-105" 
                                        onClick={() => handleUpgrade('pro')}
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Fazer Upgrade Agora
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRO → ENTERPRISE Upsell */}
                    {current.id === 'pro' && (
                        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-lg shadow-amber-500/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Building2 className="w-24 h-24 text-amber-500" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">🏆 Para Grandes Operações</Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold text-amber-400">{t.billing.enterprise_upsell_title}</h3>
                                    <p className="text-sm text-muted-foreground max-w-2xl">
                                        {t.billing.enterprise_upsell_desc}
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>SLA 99.9%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>Gerente Dedicado</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span>On-Premise</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">A partir de</div>
                                        <div className="text-4xl font-black text-amber-400">R$ 99</div>
                                        <div className="text-sm text-muted-foreground">/mês</div>
                                    </div>
                                    <Button 
                                        size="lg"
                                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 px-8 shadow-lg shadow-amber-500/20 transition-all hover:scale-105" 
                                        onClick={() => handleUpgrade('enterprise')}
                                    >
                                        <Building2 className="w-4 h-4 mr-2" />
                                        {t.billing.enterprise_upsell_button}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ENTERPRISE → MAX Upsell */}
                    {current.id === 'enterprise' && (
                        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-6 shadow-lg shadow-rose-500/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="w-24 h-24 text-rose-500" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">🔥 Melhor Custo-Benefício</Badge>
                                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Economize R$ 888/ano</Badge>
                                    </div>
                                    <h3 className="text-2xl font-bold text-rose-400">Upgrade para MAX: Plano Anual com Desconto</h3>
                                    <p className="text-sm text-muted-foreground max-w-2xl">
                                        Tudo do Enterprise + bot engine dedicado, integrações de IA e suporte VIP 24/7. 
                                        <strong className="text-rose-300"> Economize 25% pagando anualmente.</strong>
                                    </p>
                                    <div className="flex items-center gap-4 pt-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="text-muted-foreground line-through">R$ 99/mês × 12</div>
                                            <ArrowUpRight className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <div className="font-bold text-rose-400">R$ 299/ano (R$ 24.92/mês)</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Pagamento anual</div>
                                        <div className="text-4xl font-black text-rose-400">R$ 299</div>
                                        <div className="text-xs text-emerald-400 font-semibold">Economize R$ 888</div>
                                    </div>
                                    <Button 
                                        size="lg"
                                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold h-12 px-8 shadow-lg shadow-rose-500/20 transition-all hover:scale-105" 
                                        onClick={() => handleUpgrade('max')}
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Upgrade para MAX
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

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
                                    <span className="text-muted-foreground">{t.billing.usage_servers}</span>
                                    <span className="font-medium">{usageServers} / {current.limits.servers === -1 ? t.billing.unlimited : current.limits.servers}</span>
                                </div>
                                <Progress value={current.limits.servers === -1 ? 100 : Math.min((usageServers / current.limits.servers) * 100, 100)} className="h-1.5" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-muted-foreground">{t.billing.usage_tickets}</span>
                                    <span className="font-medium">{usageTickets} / {current.limits.tickets === -1 ? t.billing.unlimited : current.limits.tickets}</span>
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
                        {!isCanceling && current.id !== 'free' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                                onClick={handleCancelSubscription}
                                disabled={cancelSubscriptionMutation.isPending}
                            >
                                Cancelar Plano
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {current.id !== 'free' && (
                    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
                        <CardHeader>
                            <CardTitle className="text-base">{t.billing.upcoming_invoice}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-bold">R$ {current.price},00</span>
                                <span className="text-sm text-muted-foreground">{t.common.status}: {t.billing.active_plan}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 border border-border">
                                <Calendar className="w-4 h-4 shrink-0" />
                                {t.billing.manage_subscription}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CreditCard className="w-4 h-4 shrink-0" />
                                {t.billing.update_card}
                            </div>
                        </CardContent>
                    </Card>
                )}
                {current.id === 'free' && (
                    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent flex flex-col justify-center items-center p-6 text-center">
                        <Zap className="w-10 h-10 text-amber-500 mb-4" />
                        <CardTitle className="text-lg mb-2">{t.billing.upgrade_cta} PRO</CardTitle>
                        <CardDescription className="mb-4">
                            {t.billing.pro_plan_desc}
                        </CardDescription>
                        <Button className="bg-amber-500 hover:bg-amber-600 font-bold" onClick={() => handleUpgrade('pro')}>
                            {t.billing.upgrade_cta}
                        </Button>
                    </Card>
                )}
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
                                            <span className="text-muted-foreground text-sm mb-1">/{t.billing.per_month || "mês"}</span>
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
                                            t.common.loading
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

            {/* Feature Comparison Table - Only show if not on MAX plan */}
            {current.id !== 'max' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Comparação de Recursos</h2>
                        <Badge variant="outline" className="text-xs">
                            Encontre o plano ideal para você
                        </Badge>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[280px]">Recurso</TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-semibold">Free</span>
                                                    <span className="text-xs text-muted-foreground">R$ 0</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center bg-violet-500/5">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-semibold text-violet-400">Pro</span>
                                                    <span className="text-xs text-muted-foreground">R$ 29/mês</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center bg-amber-500/5">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-semibold text-amber-400">Enterprise</span>
                                                    <span className="text-xs text-muted-foreground">R$ 99/mês</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center bg-rose-500/5">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-semibold text-rose-400">Max</span>
                                                    <span className="text-xs text-muted-foreground">R$ 299/ano</span>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Servidores Discord</TableCell>
                                            <TableCell className="text-center text-muted-foreground">Até 3</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-violet-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Tickets/mês</TableCell>
                                            <TableCell className="text-center text-muted-foreground">100</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-violet-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Analytics Avançado</TableCell>
                                            <TableCell className="text-center">—</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-violet-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Webhooks Discord</TableCell>
                                            <TableCell className="text-center">—</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-violet-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">SLA Garantido</TableCell>
                                            <TableCell className="text-center">—</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">—</TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Gerente de Conta Dedicado</TableCell>
                                            <TableCell className="text-center">—</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">—</TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Deploy On-Premise</TableCell>
                                            <TableCell className="text-center">—</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">—</TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" />
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Bot Engine Dedicado</TableCell>
                                            <TableCell className="text-center">—</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">—</TableCell>
                                            <TableCell className="text-center bg-amber-500/5">—</TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Integrações de IA</TableCell>
                                            <TableCell className="text-center">—</TableCell>
                                            <TableCell className="text-center bg-violet-500/5">—</TableCell>
                                            <TableCell className="text-center bg-amber-500/5">—</TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-rose-400 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-t-2">
                                            <TableCell className="font-semibold">Suporte</TableCell>
                                            <TableCell className="text-center text-xs text-muted-foreground">E-mail</TableCell>
                                            <TableCell className="text-center text-xs bg-violet-500/5 font-medium text-violet-400">Prioritário</TableCell>
                                            <TableCell className="text-center text-xs bg-amber-500/5 font-medium text-amber-400">24/7</TableCell>
                                            <TableCell className="text-center text-xs bg-rose-500/5 font-medium text-rose-400">VIP 24/7</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell className="text-center">
                                                {current.id === 'free' ? (
                                                    <Badge variant="outline" className="text-xs">Plano Atual</Badge>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="text-center bg-violet-500/5">
                                                {current.id === 'pro' ? (
                                                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">Plano Atual</Badge>
                                                ) : current.id === 'free' ? (
                                                    <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white h-7 text-xs" onClick={() => handleUpgrade('pro')}>
                                                        Fazer Upgrade
                                                    </Button>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="text-center bg-amber-500/5">
                                                {current.id === 'enterprise' ? (
                                                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">Plano Atual</Badge>
                                                ) : current.id !== 'max' ? (
                                                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black h-7 text-xs font-semibold" onClick={() => handleUpgrade('enterprise')}>
                                                        Fazer Upgrade
                                                    </Button>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="text-center bg-rose-500/5">
                                                {current.id === 'max' ? (
                                                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">Plano Atual</Badge>
                                                ) : (
                                                    <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white h-7 text-xs" onClick={() => handleUpgrade('max')}>
                                                        Fazer Upgrade
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Invoice history */}
            <div>
                <h2 className="text-xl font-bold mb-4">{t.billing.invoice_history}</h2>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.billing.invoice_id}</TableHead>
                                    <TableHead>{t.billing.invoice_date}</TableHead>
                                    <TableHead>{t.billing.invoice_plan}</TableHead>
                                    <TableHead>{t.billing.invoice_amount}</TableHead>
                                    <TableHead>{t.billing.invoice_status}</TableHead>
                                    <TableHead className="text-right">{t.billing.invoice_action}</TableHead>
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
