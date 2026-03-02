'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Flag, Zap, CreditCard, Store, FlaskConical, Bot, Sparkles, Shield } from "lucide-react";

interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    icon: any;
    enabled: boolean;
    env: "production" | "beta" | "alpha";
}

import { useFeatureFlags, useToggleFeatureFlag } from "@/lib/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const envColors: Record<string, string> = {
    production: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    beta: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    alpha: "bg-rose-500/10 text-rose-400 border-rose-500/30",
};

export default function PlatformFeatures() {
    const { data: flags = [], isLoading } = useFeatureFlags();
    const toggleFlagMutation = useToggleFeatureFlag();

    const handleToggle = async (id: string, name: string) => {
        try {
            await toggleFlagMutation.mutateAsync(id);
            toast.success(`Flag "${name}" atualizada.`);
        } catch (error) {
            toast.error("Erro ao atualizar flag.");
        }
    };

    const activeCount = flags.filter(f => f.enabled).length;

    const getIcon = (key: string) => {
        switch (key) {
            case 'automation_engine': return Zap;
            case 'payment_engine': return CreditCard;
            case 'marketplace': return Store;
            case 'ai_agent': return Sparkles;
            case 'multi_game_drivers': return Bot;
            case 'advanced_rbac': return Shield;
            default: return Flag;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-amber-500">Controle de Capacidades</h1>
                    <p className="text-muted-foreground font-medium">Habilite ou desabilite módulos experimentais e core da plataforma.</p>
                </div>
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/5 px-3 py-1">
                    <Flag className="w-3.5 h-3.5 mr-2" />
                    <span className="font-bold">{activeCount}/{flags.length} Funcionalidades</span>
                </Badge>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 bg-card/50 animate-pulse border-border/10" />)}
                </div>
            ) : flags.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 bg-transparent">
                    <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground italic">Nenhuma feature flag registrada no sistema.</p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {flags.map((flag) => {
                        const IconComponent = getIcon(flag.key);
                        return (
                            <Card key={flag.id} className={`bg-card/50 backdrop-blur-sm transition-all relative overflow-hidden group ${flag.enabled ? "border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.03)]" : "border-border opacity-60 grayscale hover:grayscale-0"
                                }`}>
                                <CardHeader className="flex flex-row items-start gap-4 pb-4">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-lg ${flag.enabled ? "bg-amber-500/20 text-amber-400 shadow-amber-500/10" : "bg-muted text-muted-foreground"
                                        }`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-12">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-base font-bold tracking-tight">{flag.name}</CardTitle>
                                            <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest", envColors[flag.env] || envColors.production)}>
                                                {flag.env}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs leading-relaxed font-medium">{flag.description}</CardDescription>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <Switch
                                            checked={flag.enabled}
                                            onCheckedChange={() => handleToggle(flag.id, flag.name)}
                                            disabled={toggleFlagMutation.isPending}
                                            className="data-[state=checked]:bg-amber-500"
                                        />
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
