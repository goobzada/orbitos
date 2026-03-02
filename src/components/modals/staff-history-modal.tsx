'use client';

import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Ticket, Gavel, Clock, TrendingUp, UserCheck } from "lucide-react";

const mockHistory = [
    { date: "15 Jan 2025", event: "Entrou na equipe como Helper" },
    { date: "01 Mar 2025", event: "Promovido para Moderador" },
    { date: "15 Jun 2025", event: "Promovido para Admin" },
    { date: "20 Set 2025", event: "Ban wave: 47 bans em uma semana" },
    { date: "01 Jan 2026", event: "3.000 tickets resolvidos alcançado" },
];

interface StaffHistoryModalProps {
    open: boolean;
    onClose: () => void;
    staffMember?: {
        username: string;
        avatar?: string;
        role: string;
        ticketsResolved: number;
        punishments: number;
        avgResponseTime: string;
    } | null;
}

const roleColors: Record<string, string> = {
    OWNER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ADMIN: "bg-red-500/10 text-red-400 border-red-500/20",
    MOD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    HELPER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function StaffHistoryModal({ open, onClose, staffMember }: StaffHistoryModalProps) {
    const member = staffMember ?? {
        username: "antonio_silva",
        avatar: "https://avatar.vercel.sh/antonio",
        role: "ADMIN",
        ticketsResolved: 312,
        punishments: 89,
        avgResponseTime: "8 min",
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Histórico de Staff
                    </DialogTitle>
                </DialogHeader>

                {/* Profile */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30">
                    <Avatar className="h-14 w-14 border-2 border-border">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">@{member.username}</p>
                            <Badge variant="outline" className={roleColors[member.role] ?? ""}>
                                {member.role}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">Membro da equipe</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="border-border">
                        <CardContent className="pt-4 pb-3 text-center">
                            <Ticket className="w-4 h-4 mx-auto mb-1.5 text-blue-400" />
                            <p className="text-2xl font-bold">{member.ticketsResolved}</p>
                            <p className="text-[11px] text-muted-foreground">Tickets resolvidos</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border">
                        <CardContent className="pt-4 pb-3 text-center">
                            <Gavel className="w-4 h-4 mx-auto mb-1.5 text-red-400" />
                            <p className="text-2xl font-bold">{member.punishments}</p>
                            <p className="text-[11px] text-muted-foreground">Punições aplicadas</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border">
                        <CardContent className="pt-4 pb-3 text-center">
                            <Clock className="w-4 h-4 mx-auto mb-1.5 text-emerald-400" />
                            <p className="text-2xl font-bold">{member.avgResponseTime}</p>
                            <p className="text-[11px] text-muted-foreground">Tempo médio</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline */}
                <div>
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        Linha do Tempo
                    </p>
                    <div className="relative space-y-3 pl-6">
                        <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
                        {mockHistory.map((item, i) => (
                            <div key={i} className="relative flex flex-col gap-0.5">
                                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-primary border-2 border-background" />
                                <p className="text-sm font-medium leading-tight">{item.event}</p>
                                <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
