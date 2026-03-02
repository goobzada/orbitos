"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
    revenue: { label: "Faturamento", color: "hsl(258 90% 66%)" },
    orders: { label: "Pedidos", color: "hsl(220 90% 60%)" },
} satisfies ChartConfig;

interface OverviewChartProps {
    data?: any[];
}

const defaultData = [
    { month: "Ago", revenue: 0, orders: 0 },
    { month: "Set", revenue: 0, orders: 0 },
    { month: "Out", revenue: 0, orders: 0 },
    { month: "Nov", revenue: 0, orders: 0 },
    { month: "Dez", revenue: 0, orders: 0 },
    { month: "Jan", revenue: 0, orders: 0 },
];

export function OverviewChart({ data = defaultData }: OverviewChartProps) {
    const displayData = data && data.length > 0 ? data : defaultData;

    return (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={displayData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(258 90% 66%)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="hsl(258 90% 66%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillServers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(220 90% 60%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(220 90% 60%)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="8 8" opacity={0.1} />
                <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={<ChartTooltipContent className="bg-card/95 backdrop-blur-md border-border/10 shadow-2xl" />}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(258 90% 66%)"
                    strokeWidth={3}
                    fill="url(#fillMessages)"
                    filter="url(#glow)"
                    stackId="1"
                    animationDuration={1500}
                />
                <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(220 90% 60%)"
                    strokeWidth={3}
                    fill="url(#fillServers)"
                    filter="url(#glow)"
                    stackId="2"
                    animationDuration={2000}
                />
            </AreaChart>
        </ChartContainer>
    );
}
