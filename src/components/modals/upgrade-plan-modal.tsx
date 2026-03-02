'use client';

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowUpRight, Zap, Sparkles, Building2, X } from "lucide-react";
import { toast } from "sonner";

const plans = [
    {
        id: "FREE",
        name: "Free",
        price: "Grátis",
        icon: Zap,
        color: "text-slate-400",
        bg: "bg-slate-800",
        border: "border-slate-700",
        cta: "Fazer Downgrade",
        features: ["3 servidores", "100 tickets/mês", "Analytics básico", "Suporte por e-mail"],
    },
    {
        id: "PRO",
        name: "Pro",
        price: "R$ 29/mês",
        badge: "Mais popular",
        icon: Sparkles,
        color: "text-primary",
        bg: "bg-primary/5",
        border: "border-primary/40",
        cta: "Assinar Pro",
        features: ["Servidores ilimitados", "Tickets ilimitados", "Analytics avançado", "Multi-staff", "Webhooks Discord", "Suporte prioritário"],
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: "R$ 99/mês",
        icon: Building2,
        color: "text-amber-400",
        bg: "bg-amber-500/5",
        border: "border-amber-500/30",
        cta: "Falar com vendas",
        features: ["Tudo do Pro", "SLA 99.9%", "Gerente dedicado", "On-premise", "Integrações custom", "Suporte 24/7"],
    },
];

const currentPlan = "PRO";

interface UpgradePlanModalProps {
    open: boolean;
    onClose: () => void;
}

export function UpgradePlanModal({ open, onClose }: UpgradePlanModalProps) {
    const [selecting, setSelecting] = useState<string | null>(null);

    const handleSelect = async (planId: string) => {
        if (planId === currentPlan) return;
        setSelecting(planId);
        // Replace with: redirect to Stripe checkout or show contact form
        await new Promise(r => setTimeout(r, 1000));
        setSelecting(null);
        toast.success(`Redirecionando para checkout do plano ${planId}...`);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Upgrade de Plano
                    </DialogTitle>
                    <DialogDescription>
                        Compare os planos e escolha o ideal para sua operação.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 mt-2">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === currentPlan;
                        const isLoading = selecting === plan.id;
                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-xl border p-5 transition-all ${plan.border} ${plan.bg} ${isCurrent ? 'ring-2 ring-primary/30' : 'hover:-translate-y-0.5'}`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute top-3 right-3">
                                        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 h-4 px-1.5">
                                            Atual
                                        </Badge>
                                    </div>
                                )}
                                <div className={`w-8 h-8 rounded-lg ${plan.bg} flex items-center justify-center mb-3`}>
                                    <plan.icon className={`w-4 h-4 ${plan.color}`} />
                                </div>
                                <p className="font-bold text-base">{plan.name}</p>
                                <p className={`text-lg font-extrabold mt-1 mb-4 ${plan.color}`}>{plan.price}</p>
                                <ul className="space-y-2 flex-1 mb-5">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    size="sm"
                                    className={`w-full gap-1.5 ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    variant={isCurrent ? 'outline' : 'default'}
                                    disabled={isCurrent || isLoading === true}
                                    onClick={() => handleSelect(plan.id)}
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse">Aguarde...</span>
                                    ) : (
                                        <>
                                            {plan.cta}
                                            {!isCurrent && <ArrowUpRight className="w-3.5 h-3.5" />}
                                        </>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-2">
                    Pagamentos processados com segurança via Stripe.
                    <br />
                    Cancele a qualquer momento sem taxas de rescisão.
                </p>
            </DialogContent>
        </Dialog>
    );
}
