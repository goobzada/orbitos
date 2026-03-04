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
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Building2,
    BarChart3,
    Settings,
    LogOut,
    ShieldCheck,
    CreditCard,
    Zap,
    Cpu,
    Flag,
    LayoutGrid,
} from "lucide-react";
import { logout } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


const items = [
    { title: "Overview Global", url: "/platform", icon: LayoutDashboard },
    { title: "Organizações", url: "/platform/organizations", icon: Building2 },
    { title: "Billing Global", url: "/platform/billing", icon: CreditCard },
    { title: "Automations", url: "/platform/automations", icon: Zap },
    { title: "Drivers & Infra", url: "/platform/infrastructure", icon: Cpu },
];

const secondaryItems = [
    { title: "Feature Flags", url: "/platform/features", icon: Flag },
    { title: "Configurações", url: "/platform/settings", icon: Settings },
];

export function PlatformSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const switchToDashboard = () => {
        // Salva token original para poder voltar ao admin
        const currentToken = localStorage.getItem('token');
        if (currentToken && !localStorage.getItem('orbitos_original_token')) {
            localStorage.setItem('orbitos_original_token', currentToken);
        }
        router.push('/dashboard');
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex items-center justify-center py-5">
                <div className="flex items-center gap-2.5 px-2 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30">
                        <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent truncate">
                        Admin OS
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-widest">Plataforma</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "transition-all",
                                                isActive
                                                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/15 hover:text-amber-300 font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={cn("shrink-0", isActive && "text-amber-400")} />
                                                <span>{item.title}</span>
                                                {isActive && (
                                                    <div className="ml-auto w-1 h-4 rounded-full bg-amber-400" />
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
                    <SidebarGroupLabel className="text-xs uppercase tracking-widest">Controle</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondaryItems.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={cn(
                                                "transition-all",
                                                isActive
                                                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/15 hover:text-amber-300 font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className={cn("shrink-0", isActive && "text-amber-400")} />
                                                <span>{item.title}</span>
                                                {isActive && (
                                                    <div className="ml-auto w-1 h-4 rounded-full bg-amber-400" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-sky-400/80 hover:text-sky-300 hover:bg-sky-500/10 transition-all cursor-pointer"
                            tooltip="Ver como cliente"
                            onClick={switchToDashboard}
                        >
                            <LayoutGrid />
                            <span>Minha Dashboard</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            tooltip="Sair"
                            onClick={() => logout()}
                        >
                            <LogOut />
                            <span>Sair do Admin</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
