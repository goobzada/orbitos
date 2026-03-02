import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PlatformSidebar } from "@/components/layout/platform-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <PlatformSidebar />
            <SidebarInset>
                <DashboardHeader />
                <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
