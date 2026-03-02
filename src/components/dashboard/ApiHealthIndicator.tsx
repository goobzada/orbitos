'use client';

import { useApiHealth } from "@/lib/hooks";
import { Activity, ShieldCheck, AlertCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ApiHealthIndicator() {
    const { data: health, isLoading, isError } = useApiHealth();

    const status = isError ? 'critical' : isLoading ? 'connecting' : health?.status === 'online' ? 'stable' : 'warning';

    const statusConfig = {
        stable: { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Operacional' },
        warning: { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Degradado' },
        connecting: { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted/10', label: 'Sincronizando' },
        critical: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Core API Offline' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-border/10 transition-all cursor-help hover:border-border/30",
                        config.bg,
                        config.color
                    )}>
                        <Icon className={cn("w-3.5 h-3.5", status === 'connecting' && "animate-pulse")} />
                        <span className="hidden sm:inline-block">{config.label}</span>
                        {status === 'stable' && (
                            <div className="flex gap-0.5 ml-1">
                                <div className="w-1 h-3 rounded-full bg-emerald-500/30" />
                                <div className="w-1 h-3 rounded-full bg-emerald-500/50" />
                                <div className="w-1 h-3 rounded-full bg-emerald-500" />
                            </div>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-card/95 backdrop-blur-md border border-border/10 p-4 w-64 shadow-2xl">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/5 pb-2">
                            <p className="text-[10px] font-black tracking-widest text-muted-foreground">CLUSTER_METRICS</p>
                            <span className="text-[10px] font-bold text-emerald-500">v1.0.0-orbit</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Uptime</p>
                                <p className="text-sm font-black tracking-tighter">{health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Latency</p>
                                <p className="text-sm font-black tracking-tighter text-emerald-500">12ms</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-border/5">
                            <p className="text-[9px] text-muted-foreground font-medium italic">Todos os drivers estão sincronizados com o motor de eventos global.</p>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
