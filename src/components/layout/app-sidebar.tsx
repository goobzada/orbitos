'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Server,
    Ticket,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Bot,
    CreditCard,
    Command
} from "lucide-react";
import { logout, exitImpersonation } from "@/lib/auth";
import { useMe } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useTranslation } from "@/components/providers/language-provider";

export function AppSidebar() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { state } = useSidebar();
    const { data: user } = useMe();

    // Traduções para os itens do menu
    const items = [
        { title: t.dashboard.sidebar.analytics, url: "/dashboard", icon: LayoutDashboard },
        { title: t.dashboard.sidebar.servers, url: "/dashboard/servers", icon: Server },
        { title: t.dashboard.sidebar.automations, url: "/dashboard/automations", icon: Command },
        { title: t.dashboard.sidebar.tickets, url: "/dashboard/tickets", icon: Ticket },
        { title: "Staff", url: "/dashboard/staff", icon: Users },
        { title: "Loja VIP", url: "/dashboard/store", icon: CreditCard },
        { title: t.dashboard.sidebar.analytics, url: "/dashboard/analytics", icon: BarChart3 },
    ];

    const secondaryItems = [
        { title: t.dashboard.sidebar.billing, url: "/dashboard/billing", icon: CreditCard },
        { title: t.dashboard.sidebar.settings, url: "/dashboard/settings", icon: Settings },
    ];

    const isExpanded = state === "expanded";
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsImpersonating(!!localStorage.getItem('orbitos_original_token'));
        }
    }, [pathname]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className={cn(
                "flex items-center py-6 transition-all duration-300",
                isExpanded ? "justify-start px-2" : "justify-center px-0"
            )}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-lg shadow-violet-500/20">
                        <Bot className="h-5.5 w-5.5" />
                    </div>
                    {isExpanded && (
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent truncate animate-in fade-in slide-in-from-left-2 duration-300">
                            OrbitOS
                        </span>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-widest">
                        {t.dashboard.sidebar.menu || "Menu Principal"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "transition-all",
                                                isActive
                                                    ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500/15 hover:text-violet-300 font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={cn("shrink-0", isActive && "text-violet-400")} />
                                                <span>{item.title}</span>
                                                {isActive && (
                                                    <div className="ml-auto w-1 h-4 rounded-full bg-violet-400" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-widest">
                        {t.dashboard.sidebar.system || "Sistema"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondaryItems.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "transition-all",
                                                isActive
                                                    ? "bg-violet-500/10 text-violet-400 hover:bg-violet-500/15 hover:text-violet-300 font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={cn("shrink-0", isActive && "text-violet-400")} />
                                                <span>{item.title}</span>
                                                {isActive && (
                                                    <div className="ml-auto w-1 h-4 rounded-full bg-violet-400" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}

                            {isSuperAdmin && (
                                <SidebarMenuItem key="Plataforma">
                                    <SidebarMenuButton
                                        asChild
                                        tooltip="Plataforma Admin"
                                        className={cn(
                                            "transition-all",
                                            pathname.startsWith('/platform')
                                                ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/15 hover:text-amber-400 font-semibold"
                                                : "text-muted-foreground hover:text-amber-500/70"
                                        )}
                                    >
                                        <Link href="/platform">
                                            <ShieldCheck className={cn("shrink-0", pathname.startsWith('/platform') && "text-amber-500")} />
                                            <span>Plataforma</span>
                                            {pathname.startsWith('/platform') && (
                                                <div className="ml-auto w-1 h-4 rounded-full bg-amber-500" />
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border">
                <SidebarMenu>
                    {isImpersonating && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                className="bg-orange-500/10 text-orange-500 hover:text-orange-400 hover:bg-orange-500/20 transition-all font-semibold cursor-pointer mb-2"
                                tooltip="Encerrar Suporte"
                                onClick={() => exitImpersonation()}
                            >
                                <LogOut />
                                <span>Encerrar Suporte</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            tooltip="Sair"
                            onClick={() => logout()}
                        >
                            <LogOut />
                            <span>Sair da conta</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
