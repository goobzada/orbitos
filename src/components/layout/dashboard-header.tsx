'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { useMe } from "@/lib/hooks";
import { ApiHealthIndicator } from "@/components/dashboard/ApiHealthIndicator";
import { useTranslation } from "@/components/providers/language-provider";

export function DashboardHeader() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { data: user } = useMe();

    const breadcrumbMap: Record<string, string> = {
        "/dashboard": t.dashboard.bread.overview,
        "/dashboard/servers": t.dashboard.bread.servers,
        "/dashboard/tickets": t.dashboard.bread.tickets,
        "/dashboard/staff": t.dashboard.bread.staff,
        "/dashboard/analytics": t.dashboard.bread.analytics,
        "/dashboard/billing": t.dashboard.bread.billing,
        "/dashboard/settings": t.dashboard.bread.settings,
        "/platform": t.dashboard.bread.platform,
        "/platform/organizations": t.dashboard.bread.organizations,
        "/platform/billing": t.dashboard.bread.billing,
        "/platform/settings": t.dashboard.bread.settings,
    };

    // Support dynamic routes like /dashboard/tickets/[id]
    const currentPage =
        breadcrumbMap[pathname] ??
        breadcrumbMap[pathname.split("/").slice(0, 3).join("/")] ??
        t.dashboard.sidebar.menu;

    const breadcrumbSuffix = !breadcrumbMap[pathname] && pathname.split("/").length > 3
        ? pathname.split("/").pop()
        : null;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/50 backdrop-blur-md px-4 md:px-6 transition-all sticky top-0 z-50">
            {/* Left side */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 hover:bg-muted" />
                <Separator orientation="vertical" className="h-4 bg-border/50" />
                {/* Org Switcher */}
                <OrgSwitcher />
                <Separator orientation="vertical" className="h-4 hidden md:block bg-border/50" />
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <span className="hover:text-foreground transition-colors cursor-default">ORBITOS</span>
                    <span className="text-border">/</span>
                    <span className="text-foreground">{currentPage}</span>
                    {breadcrumbSuffix && (
                        <>
                            <span className="text-border">/</span>
                            <span className="font-black text-primary capitalize">{breadcrumbSuffix}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{t.dashboard.header.servers_growth}</span>
                </div>

                <ApiHealthIndicator />

                <Separator orientation="vertical" className="h-4 hidden md:block bg-border/50" />

                <Button variant="ghost" size="icon" className="relative h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
                    <Bell className="h-4.5 w-4.5" />
                    <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] border border-background" />
                </Button>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <div className="flex items-center gap-2 cursor-pointer group">
                    <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={user?.avatar || "https://avatar.vercel.sh/admin"} />
                        <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col leading-none">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{user?.username || t.dashboard.header.loading}</span>
                        <span className="text-[11px] text-muted-foreground capitalize">{user?.role?.toLowerCase().replace('_', ' ') || t.dashboard.header.loading}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
