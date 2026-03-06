"use client";

import { useMemo, useState } from "react";
import {
    useAddStoreDomain,
    useDeleteStoreDomain,
    useSetPrimaryStoreDomain,
    useStoreDomains,
    useVerifyStoreDomain,
} from "@/lib/hooks";
import { useActiveOrg } from "@/lib/use-org-store";
import { toast } from "sonner";
import { Globe, Plus, ShieldCheck, Trash2, CheckCircle2, LinkIcon, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StoreDomainsPage() {
    const { activeOrgId } = useActiveOrg();
    const [domainInput, setDomainInput] = useState("");

    const { data, isLoading } = useStoreDomains(activeOrgId || "");
    const addDomain = useAddStoreDomain(activeOrgId || "");
    const verifyDomain = useVerifyStoreDomain(activeOrgId || "");
    const setPrimary = useSetPrimaryStoreDomain(activeOrgId || "");
    const deleteDomain = useDeleteStoreDomain(activeOrgId || "");

    const domains = useMemo(() => (Array.isArray(data?.domains) ? data.domains : []), [data]);

    const handleAdd = async () => {
        if (!domainInput.trim()) return;
        try {
            await addDomain.mutateAsync(domainInput.trim());
            toast.success("Domínio adicionado com sucesso.");
            setDomainInput("");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Não foi possível adicionar domínio.");
        }
    };

    const handleVerify = async (domainId: string) => {
        try {
            const result = await verifyDomain.mutateAsync(domainId);
            if (result?.verification?.verified) {
                toast.success("Domínio verificado com sucesso.");
            } else {
                toast.error("Verificação falhou. Confira CNAME/TXT e tente novamente.");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Erro ao verificar domínio.");
        }
    };

    const handleSetPrimary = async (domainId: string) => {
        try {
            await setPrimary.mutateAsync(domainId);
            toast.success("Domínio primário atualizado.");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Erro ao definir domínio primário.");
        }
    };

    const handleDelete = async (domainId: string) => {
        try {
            await deleteDomain.mutateAsync(domainId);
            toast.success("Domínio removido.");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Erro ao remover domínio.");
        }
    };

    if (isLoading) {
        return <div className="max-w-5xl mx-auto p-8 text-sm text-muted-foreground">Carregando domínios...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-16">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Store Domains</h1>
                <p className="text-muted-foreground mt-2">
                    Conecte domínios customizados e configure o domínio canônico da sua loja.
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-violet-500">
                    <Globe className="w-4 h-4" />
                    Domínio Padrão
                </div>
                <div className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm">
                    {data?.defaultDomain || "-"}
                </div>
                <p className="text-xs text-muted-foreground">
                    Este domínio já nasce ativo e aponta para a sua loja automaticamente.
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="text-lg font-bold">Adicionar Domínio Customizado</h2>
                        <p className="text-xs text-muted-foreground mt-1">Exemplo: www.clientdomain.com</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[460px]">
                        <Input
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value)}
                            placeholder="www.clientdomain.com"
                            className="font-mono"
                        />
                        <Button onClick={handleAdd} disabled={addDomain.isPending} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Adicionar
                        </Button>
                    </div>
                </div>

                {addDomain.data?.dnsInstructions && (
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                        <div className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            DNS Instructions
                        </div>
                        <div className="text-xs text-muted-foreground">CNAME</div>
                        <div className="font-mono text-xs rounded border border-border bg-background p-2">
                            {addDomain.data.dnsInstructions.cname.host} → {addDomain.data.dnsInstructions.cname.value}
                        </div>
                        <div className="text-xs text-muted-foreground">TXT (opcional)</div>
                        <div className="font-mono text-xs rounded border border-border bg-background p-2">
                            {addDomain.data.dnsInstructions.txt.host} = {addDomain.data.dnsInstructions.txt.value}
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-bold">Domínios da Loja</h2>
                {domains.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum domínio cadastrado.</p>
                )}

                {domains.map((domain: any) => {
                    const isVerified = ["verified", "active"].includes(domain.status);
                    return (
                        <div key={domain.id} className="rounded-xl border border-border p-4 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="font-mono text-sm break-all">{domain.domain}</div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <span>Tipo: {domain.type}</span>
                                        <span>Status: {domain.status}</span>
                                        {domain.isPrimary && <span className="text-emerald-500">Primário</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {!isVerified && domain.type === "custom" && (
                                        <Button size="sm" variant="outline" onClick={() => handleVerify(domain.id)} disabled={verifyDomain.isPending}>
                                            <LinkIcon className="w-4 h-4 mr-1" /> Verificar
                                        </Button>
                                    )}
                                    {!domain.isPrimary && isVerified && (
                                        <Button size="sm" onClick={() => handleSetPrimary(domain.id)} disabled={setPrimary.isPending}>
                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Set Primary
                                        </Button>
                                    )}
                                    {domain.type === "custom" && (
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(domain.id)} disabled={deleteDomain.isPending}>
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {domain.status === "error" && (
                                <div className="text-xs text-amber-500 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Verificação falhou. Confira CNAME para stores gateway ou TXT de verificação.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
