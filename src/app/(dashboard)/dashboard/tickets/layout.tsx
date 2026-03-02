'use client';

import { Settings, MessageSquare, LayoutTemplate, SquareMousePointer } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
    { title: "Visão Geral", url: "/dashboard/tickets", icon: MessageSquare },
    { title: "Portais (Hub)", url: "/dashboard/tickets/portals", icon: SquareMousePointer },
    { title: "Formulários (Modais)", url: "/dashboard/tickets/templates", icon: LayoutTemplate },
    { title: "Configurações", url: "/dashboard/tickets/settings", icon: Settings },
];

export default function TicketsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sistema de Tickets</h1>
                    <p className="text-muted-foreground">Gerencie seus canais de atendimento, formulários dinâmicos e métricas de satisfação.</p>
                </div>
            </div>

            <div className="flex overflow-x-auto pb-2 border-b border-border hide-scrollbar gap-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.url;
                    return (
                        <Link key={tab.title} href={tab.url}>
                            <div
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 font-medium text-sm whitespace-nowrap",
                                    isActive
                                        ? "border-violet-500 text-violet-400 bg-violet-500/10"
                                        : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.title}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div>
                {children}
            </div>
        </div>
    );
}
