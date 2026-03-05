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
    Command,
    UserCircle,
    Cpu,
    BookOpen,
} from "lucide-react";
import { logout, exitImpersonation } from "@/lib/auth";
import { useMe } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        { title: t.dashboard.sidebar.automation_builder, url: "/dashboard/automations/builder", icon: Cpu },
        { title: t.dashboard.sidebar.tickets, url: "/dashboard/tickets", icon: Ticket },
        { title: t.dashboard.sidebar.staff, url: "/dashboard/staff", icon: Users },
        { title: t.dashboard.sidebar.store, url: "/dashboard/store", icon: CreditCard },
        { title: t.dashboard.sidebar.analytics, url: "/dashboard/analytics", icon: BarChart3 },
    ];

    const secondaryItems = [
        { title: t.dashboard.sidebar.billing, url: "/dashboard/billing", icon: CreditCard },
        { title: t.dashboard.sidebar.api_docs, url: "/dashboard/docs", icon: BookOpen },
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
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent truncate animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">OrbitUp</span>
                            <span className="text-foreground/70 font-medium">.io</span>
                        </span>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-widest">
                        {t.dashboard.sidebar.menu}
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
                        {t.dashboard.sidebar.system}
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
                                            <span>{t.dashboard.sidebar.platform}</span>
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
                                <span>{t.dashboard.sidebar.exit_support}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {/* Avatar + nome → link para /dashboard/profile */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Meu Perfil"
                            className={cn(
                                "transition-all h-auto py-2",
                                pathname === '/dashboard/profile'
                                    ? "bg-violet-500/10 text-violet-400"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Link href="/dashboard/profile" className="flex items-center gap-2.5">
                                <Avatar className="w-7 h-7 shrink-0">
                                    <AvatarImage
                                        src={user?.avatar && user?.discordId
                                            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=64`
                                            : undefined}
                                    />
                                    <AvatarFallback className="bg-violet-600/20 text-violet-300 text-xs font-bold">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">{user?.username || t.dashboard.sidebar.profile}</p>
                                    <p className="text-[10px] text-muted-foreground/60 truncate">{t.dashboard.sidebar.view_profile}</p>
                                </div>
                                <UserCircle className="w-3.5 h-3.5 shrink-0 opacity-50" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            tooltip="Sair"
                            onClick={() => logout()}
                        >
                            <LogOut />
                            <span>{t.dashboard.sidebar.logout}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
