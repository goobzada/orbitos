'use client';

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    title: string;
    value: string | number;
    trend: number;
    comparisonLabel: string;
    sparklineData?: { value: number }[];
    icon: LucideIcon;
    color?: "primary" | "amber" | "emerald" | "rose" | "blue" | "violet";
    delay?: number;
}

const colorVariants = {
    primary: "text-primary border-primary/20 bg-primary/5 shadow-primary/5",
    amber: "text-amber-500 border-amber-500/20 bg-amber-500/5 shadow-amber-500/5",
    emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/5",
    rose: "text-rose-500 border-rose-500/20 bg-rose-500/5 shadow-rose-500/5",
    blue: "text-blue-500 border-blue-500/20 bg-blue-500/5 shadow-blue-500/5",
    violet: "text-violet-500 border-violet-500/20 bg-violet-500/5 shadow-violet-500/5",
};

const chartColors = {
    primary: "hsl(var(--primary))",
    amber: "#f59e0b",
    emerald: "#10b981",
    rose: "#f43f5e",
    blue: "#3b82f6",
    violet: "#8b5cf6",
};

export function KpiCard({
    title,
    value,
    trend,
    comparisonLabel,
    sparklineData,
    icon: Icon,
    color = "primary",
    delay = 0,
}: KpiCardProps) {
    const isPositive = trend >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card className="relative overflow-hidden bg-card/30 backdrop-blur-md border border-border/10 shadow-2xl hover:border-border/20 transition-all group">
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 -mr-16 -mt-16 rounded-full group-hover:opacity-20 transition-opacity",
                    color === 'primary' ? 'bg-primary' : `bg-${color}-500`
                )} />

                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                            "p-2.5 rounded-xl border flex items-center justify-center transition-colors group-hover:scale-110 duration-300",
                            colorVariants[color]
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                            isPositive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">{title}</p>
                        <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
                        <p className="text-[10px] text-muted-foreground font-medium italic">{comparisonLabel}</p>
                    </div>

                    {sparklineData && (
                        <div className="h-10 w-full mt-4 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <defs>
                                        <linearGradient id={`grad-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={chartColors[color]} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={chartColors[color]} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={chartColors[color]}
                                        strokeWidth={2}
                                        fill={`url(#grad-${title.replace(/\s+/g, '-')})`}
                                        isAnimationActive={true}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
