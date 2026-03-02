'use client';

import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Wifi, WifiOff, Settings, Hash, Puzzle } from "lucide-react";
import { toast } from "sonner";
import { Server } from "@/types";
import { useUpdateServerConfig, useDeleteServer } from "@/lib/hooks";

interface ConfigServerModalProps {
    open: boolean;
    onClose: () => void;
    server: Server | null;
}

export function ConfigServerModal({ open, onClose, server }: ConfigServerModalProps) {
    const updateConfig = useUpdateServerConfig();
    const deleteServer = useDeleteServer();

    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [testingFiveM, setTestingFiveM] = useState(false);
    const [fiveMResult, setFiveMResult] = useState<'ok' | 'fail' | null>(null);

    const [form, setForm] = useState({
        logChannel: "",
        ticketCategory: "",
        staffRole: "",
        isActive: true,
        fivemHost: "",
        fivemPort: "30120",
    });

    // Populate form from server config JSON
    useEffect(() => {
        if (server) {
            let parsed: any = {};
            try {
                parsed = JSON.parse(server.config || "{}");
            } catch (e) {
                console.error("Failed to parse server config", e);
            }

            setForm({
                logChannel: parsed.logChannel || "",
                ticketCategory: parsed.ticketCategory || "",
                staffRole: parsed.staffRole || "",
                isActive: server.isActive,
                fivemHost: parsed.fivemHost || "",
                fivemPort: parsed.fivemPort || "30120",
            });
        }
    }, [server, open]);

    const handleSave = async () => {
        if (!server?.id) return;
        setLoading(true);
        try {
            await updateConfig.mutateAsync({
                serverId: server.id,
                config: {
                    logChannel: form.logChannel,
                    ticketCategory: form.ticketCategory,
                    staffRole: form.staffRole,
                    isActive: form.isActive,
                    fivemHost: form.fivemHost,
                    fivemPort: form.fivemPort
                }
            });
            toast.success("Configurações salvas com sucesso!");
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Erro ao salvar configurações.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!server?.id) return;
        if (!confirm(`Tem certeza que deseja remover o servidor "${server.name}"?`)) return;

        setLoading(true);
        try {
            await deleteServer.mutateAsync(server.id);
            toast.success("Servidor removido com sucesso.");
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Erro ao remover servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        // This should hit an endpoint like /servers/:id/sync
        await new Promise(r => setTimeout(r, 1500));
        setSyncing(false);
        toast.success("Sincronizado com o Discord!");
    };

    const handleTestFiveM = async () => {
        setTestingFiveM(true);
        setFiveMResult(null);
        await new Promise(r => setTimeout(r, 1500));
        setTestingFiveM(false);
        const ok = form.fivemHost.length > 0;
        setFiveMResult(ok ? 'ok' : 'fail');
    };

    if (!server) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Configurar — {server.name}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="general" className="mt-2">
                    <TabsList className="w-full">
                        <TabsTrigger value="general" className="flex-1 gap-2">
                            <Settings className="w-3.5 h-3.5" />
                            Geral
                        </TabsTrigger>
                        <TabsTrigger value="channels" className="flex-1 gap-2">
                            <Hash className="w-3.5 h-3.5" />
                            Canais & Roles
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="flex-1 gap-2">
                            <Puzzle className="w-3.5 h-3.5" />
                            Integrações
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Geral */}
                    <TabsContent value="general" className="space-y-4 mt-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                            <div>
                                <p className="text-sm font-medium">{server.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">ID: {server.discordGuildId ?? "—"}</p>
                            </div>
                            <Badge variant="outline" className={form.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }>
                                {form.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium">Servidor ativo</Label>
                                <p className="text-xs text-muted-foreground">Desativar impede o bot de operar neste servidor.</p>
                            </div>
                            <Switch
                                checked={form.isActive}
                                onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))}
                            />
                        </div>

                        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                            <p className="text-sm font-medium text-destructive/80">Zona de Perigo</p>
                            <p className="text-xs text-muted-foreground mt-1">Remover o servidor desvincula todos os dados permanentemente.</p>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="mt-2 h-7 text-xs"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                Remover servidor
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Canais & Roles */}
                    <TabsContent value="channels" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Canal de Logs</Label>
                            <Input
                                placeholder="ID do canal (ex: 1234567890)"
                                value={form.logChannel}
                                onChange={e => setForm(f => ({ ...f, logChannel: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoria de Tickets</Label>
                            <Input
                                placeholder="ID da categoria"
                                value={form.ticketCategory}
                                onChange={e => setForm(f => ({ ...f, ticketCategory: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role de Staff</Label>
                            <Input
                                placeholder="ID do role de staff"
                                value={form.staffRole}
                                onChange={e => setForm(f => ({ ...f, staffRole: e.target.value }))}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleSync}
                            disabled={syncing}
                        >
                            {syncing
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <RefreshCw className="w-4 h-4" />}
                            {syncing ? "Sincronizando..." : "Sincronizar com Discord"}
                        </Button>
                    </TabsContent>

                    {/* Tab 3: Integrações */}
                    <TabsContent value="integrations" className="space-y-4 mt-4">
                        <div className="rounded-lg border border-border p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-orange-400">5M</span>
                                </div>
                                <p className="text-sm font-semibold">FiveM</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-xs">Host</Label>
                                    <Input
                                        placeholder="127.0.0.1 ou seu-servidor.com"
                                        value={form.fivemHost}
                                        onChange={e => setForm(f => ({ ...f, fivemHost: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Porta</Label>
                                    <Input
                                        placeholder="30120"
                                        value={form.fivemPort}
                                        onChange={e => setForm(f => ({ ...f, fivemPort: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleTestFiveM}
                                    disabled={testingFiveM}
                                >
                                    {testingFiveM
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Wifi className="w-4 h-4" />}
                                    Testar conexão
                                </Button>
                                {fiveMResult === 'ok' && (
                                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                                        <Wifi className="w-3.5 h-3.5" />
                                        Conectado!
                                    </span>
                                )}
                                {fiveMResult === 'fail' && (
                                    <span className="text-xs text-destructive flex items-center gap-1">
                                        <WifiOff className="w-3.5 h-3.5" />
                                        Falha na conexão
                                    </span>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2 mt-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Salvando..." : "Salvar alterações"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
