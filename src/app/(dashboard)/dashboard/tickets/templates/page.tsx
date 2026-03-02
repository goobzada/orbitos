'use client';

import { useState } from "react";
import { Plus, LayoutTemplate, Trash2, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "next/navigation";
import { useTicketTemplates, useDeleteTicketTemplate, useServers } from "@/lib/hooks";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TemplatesPage() {
    const { organizationId } = useParams();
    const orgId = organizationId as string;
    const { data: servers = [] } = useServers();
    const { data: templates = [], isLoading } = useTicketTemplates(orgId);
    const deleteTemplate = useDeleteTicketTemplate(orgId);

    const [serverFilter, setServerFilter] = useState("all");

    const filteredTemplates = serverFilter === "all"
        ? templates
        : templates.filter(p => p.serverId === serverFilter);

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este template?")) return;
        try {
            await deleteTemplate.mutateAsync(id);
            toast.success("Template removido.");
        } catch (error) {
            toast.error("Erro ao remover template.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter">Templates de Suporte</h2>
                    <p className="text-sm text-muted-foreground font-medium">Configure os formulários que os usuários preenchem ao abrir tickets.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20">
                            <Plus className="w-4 h-4" />
                            Novo Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800">
                        <DialogHeader>
                            <DialogTitle>Criar Template de Ticket</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Defina os campos e regras do formulário de abertura.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Template</Label>
                                <Input id="name" placeholder="Ex: Suporte Geral" className="bg-slate-900 border-slate-800" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="key">Identificador (Key)</Label>
                                <Input id="key" placeholder="Ex: suporte_geral" className="bg-slate-900 border-slate-800 font-mono" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Servidor</Label>
                                <Select>
                                    <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-300">
                                        <SelectValue placeholder="Selecione o servidor" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                                        {servers.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                                toast.success("Template criado com sucesso!");
                            }}>
                                Criar Template
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4 py-2">
                <div className="w-full md:w-[250px]">
                    <Select value={serverFilter} onValueChange={setServerFilter}>
                        <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300">
                            <SelectValue placeholder="Filtrar por servidor" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-slate-300">
                            <SelectItem value="all">Todos os Servidores</SelectItem>
                            {servers.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-2xl border border-border/10 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/20">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[300px] text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome / Identificador</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Servidor</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Config</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 animate-pulse text-muted-foreground italic">Sincronizando templates...</TableCell>
                            </TableRow>
                        ) : filteredTemplates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Nenhum template encontrado para os critérios selecionados.</TableCell>
                            </TableRow>
                        ) : filteredTemplates.map((template) => (
                            <TableRow key={template.id} className="group hover:bg-primary/[0.02] transition-colors border-border/5">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 shadow-inner">
                                            <LayoutTemplate className="w-5 h-5 text-primary opacity-70" />
                                        </div>
                                        <div>
                                            <p className="font-bold tracking-tight">{template.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded w-fit">{template.key}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-semibold text-muted-foreground">{template.server?.name || "Global"}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary">
                                        {template.fields?.length || 0} CAMPOS
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={template.isActive ? "default" : "secondary"} className={template.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground"}>
                                        {template.isActive ? "ATIVO" : "INATIVO"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-colors"
                                            onClick={() => handleDelete(template.id)}
                                            disabled={deleteTemplate.isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
