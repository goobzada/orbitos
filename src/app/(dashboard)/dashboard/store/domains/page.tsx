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
import { Globe, Plus, ShieldCheck, Trash2, CheckCircle2, LinkIcon, AlertCircle, Copy, CircleHelp } from "lucide-react";
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
    const defaultDomain = data?.defaultDomain || (data?.store?.slug ? `${data.store.slug}.orbicapp.com` : null);

    const statusMeta: Record<string, { label: string; className: string }> = {
        pending: { label: "Pending DNS", className: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
        verified: { label: "Verified", className: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
        active: { label: "Active", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
        error: { label: "Error", className: "text-red-400 bg-red-500/10 border-red-500/30" },
    };

    const copyToClipboard = async (text: string, label = "valor") => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copiado.`);
        } catch {
            toast.error(`Não foi possível copiar ${label}.`);
        }
    };

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

    if (!activeOrgId) {
        return <div className="max-w-5xl mx-auto p-8 text-sm text-muted-foreground">Selecione uma organização para gerenciar domínios.</div>;
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
                <div className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm flex items-center justify-between gap-3">
                    <span>{defaultDomain || "Não disponível"}</span>
                    {defaultDomain && (
                        <Button size="sm" variant="outline" className="h-8" onClick={() => copyToClipboard(defaultDomain, "domínio padrão")}> 
                            <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/30">Active</span>
                    <p className="text-muted-foreground">Este domínio nasce pronto e sempre aponta para sua loja.</p>
                </div>
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

                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                    <div className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        DNS Instructions
                    </div>

                    <div className="text-xs text-muted-foreground">CNAME</div>
                    <div className="font-mono text-xs rounded border border-border bg-background p-2 flex items-center justify-between gap-3">
                        <span>
                            {(addDomain.data?.dnsInstructions?.cname?.host || "www")}
                            {" → "}
                            {(addDomain.data?.dnsInstructions?.cname?.value || "stores.orbicapp.com")}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => copyToClipboard(`${addDomain.data?.dnsInstructions?.cname?.host || "www"} -> ${addDomain.data?.dnsInstructions?.cname?.value || "stores.orbicapp.com"}`, "CNAME")}
                        >
                            <Copy className="w-3 h-3 mr-1" /> Copiar
                        </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">TXT (opcional)</div>
                    <div className="font-mono text-xs rounded border border-border bg-background p-2 flex items-center justify-between gap-3">
                        <span>
                            {(addDomain.data?.dnsInstructions?.txt?.host || "_orbic.seu-dominio.com")}
                            {" = "}
                            {(addDomain.data?.dnsInstructions?.txt?.value || "orbic-verify=TOKEN")}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => copyToClipboard(`${addDomain.data?.dnsInstructions?.txt?.host || "_orbic.seu-dominio.com"} = ${addDomain.data?.dnsInstructions?.txt?.value || "orbic-verify=TOKEN"}`, "TXT")}
                        >
                            <Copy className="w-3 h-3 mr-1" /> Copiar
                        </Button>
                    </div>

                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <CircleHelp className="w-3.5 h-3.5" />
                        Após configurar DNS, clique em <strong>Verificar</strong> no domínio para atualizar status.
                    </p>
                </div>
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
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                                        <span>Tipo: {domain.type}</span>
                                        <span className={`px-2 py-0.5 rounded-full border ${statusMeta[domain.status]?.className || "text-white/70 border-white/20"}`}>
                                            {statusMeta[domain.status]?.label || domain.status}
                                        </span>
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
                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Definir Primário
                                        </Button>
                                    )}
                                    {domain.type === "custom" && (
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(domain.id)} disabled={deleteDomain.isPending}>
                                            <Trash2 className="w-4 h-4 mr-1" /> Remover
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

                <div className="rounded-xl border border-border/70 bg-background/40 p-4 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-semibold text-white/80">Legenda de status</p>
                    <p><span className="text-amber-400">Pending DNS</span>: aguardando propagação DNS.</p>
                    <p><span className="text-blue-400">Verified</span>: domínio validado, pronto para ativação primária.</p>
                    <p><span className="text-emerald-400">Active</span>: domínio ativo para acesso público.</p>
                    <p><span className="text-red-400">Error</span>: verificação falhou, revise CNAME/TXT.</p>
                </div>
            </div>
        </div>
    );
}
