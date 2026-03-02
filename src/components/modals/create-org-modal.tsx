'use client';

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useCreateOrganization } from "@/lib/hooks";

const COMMUNITY_TYPES = [
    { value: 'game', label: 'Gaming/Jogos' },
    { value: 'music', label: 'Música/Artistas' },
    { value: 'study', label: 'Estudos/Educação' },
    { value: 'business', label: 'Negócios/Empresas' },
    { value: 'creator', label: 'Criadores de Conteúdo' },
    { value: 'dev', label: 'Desenvolvedores/Tech' },
    { value: 'general', label: 'Geral/Misc' },
];

interface CreateOrgModalProps {
    open: boolean;
    onClose: () => void;
}

export function CreateOrgModal({ open, onClose }: CreateOrgModalProps) {
    const createOrg = useCreateOrganization();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [communityType, setCommunityType] = useState("general");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("O nome da organização é obrigatório.");
            return;
        }

        setError("");
        setLoading(true);
        try {
            await createOrg.mutateAsync({ name, communityType });
            toast.success("Organização criada com sucesso!");
            setName("");
            setCommunityType("general");
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Erro ao criar organização.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-primary" />
                        Nova Organização / Workspace
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Nome do Workspace</Label>
                        <Input
                            placeholder="Ex: Minha Empresa, OrbitOS Hub..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            Este será o nome principal da sua organização no dashboard.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Comunidade</Label>
                        <Select value={communityType} onValueChange={setCommunityType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMUNITY_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Isso nos ajuda a personalizar os módulos recomendados para você.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Criando..." : "Criar Organização"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
