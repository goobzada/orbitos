'use client';

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";
import { useServers, useAddStaffMember } from "@/lib/hooks";

const roles = [
    { value: "OWNER", label: "Owner", color: "text-amber-400", desc: "Controle total" },
    { value: "ADMIN", label: "Admin", color: "text-red-400", desc: "Gerencia staff e config" },
    { value: "MOD", label: "Moderador", color: "text-blue-400", desc: "Moderação e tickets" },
    { value: "HELPER", label: "Helper", color: "text-emerald-400", desc: "Suporte básico" },
];

interface AddStaffModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddStaffModal({ open, onClose }: AddStaffModalProps) {
    const { data: servers = [], isLoading: loadingServers } = useServers();
    const addStaff = useAddStaffMember();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        serverId: "",
        discordId: "",
        username: "",
        role: "",
    });
    const [error, setError] = useState("");

    const selectedRole = roles.find(r => r.value === form.role);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.serverId) { setError("Selecione um servidor."); return; }
        if (!form.discordId.trim()) { setError("ID do Discord é obrigatório."); return; }
        if (!form.username.trim()) { setError("Username é obrigatório."); return; }
        if (!form.role) { setError("Selecione uma função."); return; }

        setError("");
        setLoading(true);

        try {
            await addStaff.mutateAsync({
                serverId: form.serverId,
                discordUserId: form.discordId,
                username: form.username,
                role: form.role
            });

            toast.success("Membro de staff adicionado com sucesso!");
            setForm({ serverId: "", discordId: "", username: "", role: "" });
            onClose();
        } catch (err: any) {
            console.error('[STAFF] Create error:', err);
            const msg = err?.response?.data?.error || "Erro ao adicionar membro.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Adicionar Membro de Staff
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Servidor</Label>
                        <Select onValueChange={(v) => setForm(f => ({ ...f, serverId: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingServers ? "Carregando..." : "Selecionar servidor..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {servers.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            placeholder="Ex: Kaiky"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>ID do Discord</Label>
                        <Input
                            placeholder="Ex: 123456789012345678"
                            value={form.discordId}
                            onChange={e => setForm(f => ({ ...f, discordId: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">
                            Copie clicando com botão direito no usuário → Copiar ID.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Função</Label>
                        <Select onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecionar função..." />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(r => (
                                    <SelectItem key={r.value} value={r.value}>
                                        <span className="flex items-center gap-2">
                                            <Shield className={`w-3.5 h-3.5 ${r.color}`} />
                                            <span className="font-medium">{r.label}</span>
                                            <span className="text-muted-foreground text-xs">— {r.desc}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedRole && (
                            <div className={`text-xs px-2.5 py-1.5 rounded-lg border border-border bg-secondary/30 flex items-center gap-1.5 ${selectedRole.color}`}>
                                <Shield className="w-3 h-3" />
                                <strong>{selectedRole.label}:</strong>
                                <span className="text-muted-foreground">{selectedRole.desc}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Adicionando..." : "Adicionar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
