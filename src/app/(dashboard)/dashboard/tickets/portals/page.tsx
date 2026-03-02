'use client';

import { useState } from "react";
import { Plus, SquareMousePointer, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useServers } from "@/lib/hooks";

// Mock para enquanto não integramos com GET /ticket-portals
const MOCK_PORTALS = [
    { id: "1", serverId: "1", name: "Central de Ajuda", channel: "#suporte", status: "Ativo", buttons: 2, lastUpdate: "Há 2 dias" },
    { id: "2", serverId: "1", name: "Área de Denúncias", channel: "#denuncias", status: "Ativo", buttons: 1, lastUpdate: "Há 1 semana" },
    { id: "3", serverId: "2", name: "Suporte VIP", channel: "#vip-support", status: "Inativo", buttons: 3, lastUpdate: "Há 1 mês" },
];

export default function PortalsPage() {
    const { data: servers = [] } = useServers();
    const [serverFilter, setServerFilter] = useState("all");

    // Filtrar localmente (mock)
    const filteredPortals = serverFilter === "all"
        ? MOCK_PORTALS
        : MOCK_PORTALS.filter(p => p.serverId === serverFilter);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Portais de Ticket</h2>
                    <p className="text-sm text-muted-foreground">Gerencie os painéis (Hubs) que são enviados ao Discord contendo os botões de abertura.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20">
                            <Plus className="w-4 h-4" />
                            Criar Portal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Portal</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Configure um novo painel de tickets para o seu servidor Discord.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Portal</Label>
                                <Input id="name" placeholder="Ex: Central de Suporte" className="bg-slate-900 border-slate-700" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="channel">Canal (ID ou #nome)</Label>
                                <Input id="channel" placeholder="Ex: #suporte" className="bg-slate-900 border-slate-700 font-mono" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Servidor</Label>
                                <Select>
                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                        <SelectValue placeholder="Selecione o servidor" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800">
                                        {servers.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                                toast.success("Portal criado com sucesso!");
                                // Aqui dispararia a mutation real
                            }}>
                                Salvar Configuração
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4 py-2">
                <div className="w-full md:w-[250px]">
                    <Select value={serverFilter} onValueChange={setServerFilter}>
                        <SelectTrigger className="bg-slate-950 border-slate-800">
                            <SelectValue placeholder="Filtrar por servidor" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800">
                            <SelectItem value="all">Todos os Servidores</SelectItem>
                            {servers.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Nome do Portal</TableHead>
                            <TableHead>Canal</TableHead>
                            <TableHead className="text-center">Botões</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Última Att.</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPortals.map((portal) => (
                            <TableRow key={portal.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                            <SquareMousePointer className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <span className="font-semibold">{portal.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-foreground bg-secondary px-2 py-1 rounded-md font-mono border border-border">
                                        {portal.channel}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center font-bold">
                                    {portal.buttons}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={portal.status === "Ativo" ? "default" : "secondary"}>
                                        {portal.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {portal.lastUpdate}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-400 group/btn">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-rose-400" />
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
