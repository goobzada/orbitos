'use client';

import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Check, ExternalLink, Bot, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { useOrganizations, useAddServer } from "@/lib/hooks";
import { CreateOrgModal } from "./create-org-modal";

const CLIENT_ID = "1357217419260596425";
const INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

interface AddServerModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddServerModal({ open, onClose }: AddServerModalProps) {
    const { data: apiOrgs, isLoading: orgsLoading } = useOrganizations();
    const orgs = apiOrgs || [];

    const addServer = useAddServer();
    const [showCreateOrg, setShowCreateOrg] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ orgId: "", guildId: "", name: "" });
    const [error, setError] = useState("");

    // Auto-select if only one organization exists
    useEffect(() => {
        if (orgs.length === 1 && !form.orgId) {
            setForm(f => ({ ...f, orgId: orgs[0].id }));
        }
    }, [orgs, form.orgId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(INVITE_URL);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success("Link copiado!");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.guildId.trim()) {
            setError("Discord Guild ID é necessário.");
            return;
        }
        if (!form.orgId) {
            setError("Selecione um Workspace para vincular.");
            return;
        }

        setError("");
        setLoading(true);
        try {
            await addServer.mutateAsync({
                organizationId: form.orgId,
                discordGuildId: form.guildId,
                name: form.name || "Enterprise Node",
            });

            toast.success("Servidor integrado com sucesso!", {
                description: "O bot agora começará a sincronizar os dados."
            });
            onClose();
            setForm({ orgId: "", guildId: "", name: "" });
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || "Erro desconhecido";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0 gap-0">
                {/* Decorative TOP bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-500" />

                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20 shadow-inner">
                                <Bot className="w-5.5 h-5.5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">Provisionar Servidor</DialogTitle>
                                <DialogDescription className="text-muted-foreground/80">Vincule um cluster do Discord à sua infraestrutura.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-start gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 animate-in fade-in zoom-in-95">
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Step 1: INVITE */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/70">1. Autorização Obrigatória</Label>
                                    <Badge variant="outline" className="text-[9px] py-0 h-4 border-violet-500/30 text-violet-400 bg-violet-500/5 uppercase font-black">Recomendado</Badge>
                                </div>
                                <div className="flex items-center gap-2 group">
                                    <div className="relative flex-1">
                                        <Input
                                            readOnly
                                            value={INVITE_URL}
                                            className="h-10 text-[10px] font-mono text-muted-foreground bg-secondary/20 border-border/20 pr-10 focus-visible:ring-0 focus-visible:border-border/20"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleCopy}
                                                className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 border-border/20 bg-secondary/20 hover:bg-secondary/40" asChild>
                                        <a href={INVITE_URL} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </Button>
                                </div>
                                <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                                    <p className="text-[11px] leading-relaxed text-muted-foreground flex items-start gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                                        <span>Instale o core no seu servidor primeiro para habilitar o log e as ferramentas de gestão.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/70">2. Destino de Provisionamento</Label>
                                    <button
                                        type="button"
                                        className="text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-colors uppercase tracking-tighter"
                                        onClick={() => setShowCreateOrg(true)}
                                    >
                                        + Novo Workspace
                                    </button>
                                </div>
                                <Select value={form.orgId} onValueChange={(v) => setForm(f => ({ ...f, orgId: v }))}>
                                    <SelectTrigger className="h-11 bg-secondary/20 border-border/20 focus:ring-violet-500/20">
                                        <SelectValue placeholder={orgsLoading ? "Consultando APIs..." : "Selecionar Workspace..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgs.map(o => (
                                            <SelectItem key={o.id} value={o.id} className="text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center text-[8px] font-bold">{o.name[0]}</div>
                                                    {o.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                        {orgs.length === 0 && !orgsLoading && (
                                            <div className="p-4 text-center text-xs text-muted-foreground">Você ainda não possui nenhum workspace.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* IDs */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/70">3. Identificadores</Label>
                                    <Input
                                        placeholder="Discord Guild ID (Ex: 82181059...)"
                                        value={form.guildId}
                                        onChange={(e) => setForm(f => ({ ...f, guildId: e.target.value }))}
                                        className="h-11 bg-secondary/20 border-border/20"
                                    />
                                    <Input
                                        placeholder="Nome Amigável (Opcional)"
                                        value={form.name}
                                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="h-11 bg-secondary/20 border-border/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-8 flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 h-11 font-bold text-muted-foreground hover:bg-secondary/40 transition-all rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-600/20 transition-all active:scale-95 gap-2 rounded-xl"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                {loading ? "Processando..." : "Confirmar Vínculo"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>

            <CreateOrgModal
                open={showCreateOrg}
                onClose={() => setShowCreateOrg(false)}
            />
        </Dialog>
    );
}
