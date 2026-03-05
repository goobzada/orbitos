'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, ExternalLink, Shield, X, Sparkles, Building2, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
    usePlatformOrganizations,
    useUpdatePlatformOrganization,
    useDeletePlatformOrganization
} from "@/lib/hooks";

export default function PlatformOrgs() {
    const { data: orgs = [], isLoading } = usePlatformOrganizations();
    const updateOrg = useUpdatePlatformOrganization();
    const deleteOrg = useDeletePlatformOrganization();
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleAccessDirectly = (orgId: string, orgName: string) => {
        localStorage.setItem('orbitos_active_org', orgId);
        toast.success(`Acessando o painel de: ${orgName}`);

        // Simulando que estamos "impersonando" visualmente para o botão "Encerrar Suporte" aparecer
        const currentToken = localStorage.getItem('token');
        if (currentToken && !localStorage.getItem('orbitos_original_token')) {
            localStorage.setItem('orbitos_original_token', currentToken);
        }

        queryClient.clear();
        router.push('/dashboard');
    };

    const handleToggleStatus = async (orgId: string, currentStatus: string) => {
        const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
        try {
            await updateOrg.mutateAsync({ id: orgId, data: { status: nextStatus } });
            toast.success(`Organização ${nextStatus === "Active" ? "reativada" : "suspensa"}`);
        } catch (error) {
            toast.error("Erro ao alterar status");
        }
    };

    const handlePlanChange = async (orgId: string, plan: string) => {
        try {
            await updateOrg.mutateAsync({ id: orgId, data: { plan } });
            toast.success(`Plano da organização alterado para ${plan}`);
        } catch (error: any) {
            const backendError = error?.response?.data?.error;
            const backendDetail = error?.response?.data?.detail;
            toast.error(backendError || backendDetail || "Erro ao alterar plano");
        }
    };

    const handleDelete = async (orgId: string, name: string) => {
        if (!confirm(`TEM CERTEZA que deseja APAGAR a organização ${name}? Esta ação é irreversível.`)) return;
        try {
            await deleteOrg.mutateAsync(orgId);
            toast.success("Organização removida permanentemente");
        } catch (error) {
            toast.error("Erro ao remover organização");
        }
    };

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orgs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `orbit_organizations_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast.success("Exportando JSON...");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
                        <Sparkles className="w-4 h-4" />
                        Platform Core
                    </div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Building2 className="w-10 h-10 text-amber-500" />
                        Organizações
                    </h1>
                    <p className="text-muted-foreground text-lg">Gerenciamento global de tenants, planos e infraestrutura.</p>
                </div>
                <Button className="bg-amber-500 hover:bg-amber-600 font-black h-12 px-6 rounded-xl shadow-lg shadow-amber-500/20 gap-2" onClick={downloadJson}>
                    <Download className="w-5 h-5" /> Exportar JSON
                </Button>
            </div>

            <Card className="bg-card/30 backdrop-blur-xl border-amber-500/10 overflow-hidden rounded-[2rem] shadow-2xl">
                <Table>
                    <TableHeader className="bg-muted/40 border-b border-white/5">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-6 px-8 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Organização / Owner</TableHead>
                            <TableHead className="py-6 px-8 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Assinatura / Plano</TableHead>
                            <TableHead className="py-6 px-8 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter">Status Global</TableHead>
                            <TableHead className="py-6 px-8 font-black uppercase text-[11px] text-amber-500/70 tracking-tighter text-right">Ações de Controle</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-medium animate-pulse">Carregando infraestrutura global...</TableCell></TableRow>
                        ) : orgs.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">Nenhuma organização encontrada no banco de dados.</TableCell></TableRow>
                        ) : orgs.map((org) => (
                            <TableRow key={org.id} className="hover:bg-amber-500/5 group transition-colors border-b border-white/5 last:border-0">
                                <TableCell className="py-6 px-8">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-extrabold text-lg text-foreground group-hover:text-amber-400 transition-colors uppercase tracking-tight">{org.name}</span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-white/5 text-[9px] h-4 px-1.5 border-none font-mono">ID: {org.id.slice(0, 8)}</Badge>
                                            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">@{org.owner?.username || "N/A"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <Select
                                        value={org.plan || "FREE"}
                                        onValueChange={(val) => handlePlanChange(org.id, val)}
                                    >
                                        <SelectTrigger className={cn(
                                            "w-[140px] h-9 rounded-lg font-black text-[10px] uppercase tracking-widest border-2",
                                            org.plan === "MAX" ? "border-amber-500/30 bg-amber-500/10 text-amber-500" :
                                                org.plan === "ENTERPRISE" ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" :
                                                org.plan === "PRO" ? "border-violet-500/30 bg-violet-500/10 text-violet-500" :
                                                    "border-muted bg-muted/50 text-muted-foreground"
                                        )}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/95 backdrop-blur-xl border-border">
                                            <SelectItem value="FREE" className="font-bold text-[10px] uppercase tracking-widest">Base (FREE)</SelectItem>
                                            <SelectItem value="PRO" className="font-bold text-[10px] uppercase tracking-widest text-violet-500">Professional (PRO)</SelectItem>
                                            <SelectItem value="ENTERPRISE" className="font-bold text-[10px] uppercase tracking-widest text-cyan-400">Enterprise (ENTERPRISE)</SelectItem>
                                            <SelectItem value="MAX" className="font-bold text-[10px] uppercase tracking-widest text-amber-500">Ultimate (MAX)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <Badge className={cn(
                                        "rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2",
                                        org.status === "Active" ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-rose-500/5 text-rose-500 border-rose-500/20"
                                    )}>
                                        {org.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "rounded-xl font-bold text-xs gap-2 transition-all",
                                                org.status === "Active" ? "text-rose-400 border-rose-500/20 hover:bg-rose-500/10" : "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                                            )}
                                            onClick={() => handleToggleStatus(org.id, org.status)}
                                        >
                                            <Shield className="w-4 h-4" />
                                            {org.status === "Active" ? "Suspender Access" : "Reativar Access"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl font-bold text-xs gap-2 transition-all text-violet-400 border-violet-500/20 hover:bg-violet-500/10"
                                            onClick={() => handleAccessDirectly(org.id, org.name)}
                                            title="Ver painel como administrador global"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Ver Org
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                            onClick={() => handleDelete(org.id, org.name)}
                                            title="Delete permanentemente do cluster"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

