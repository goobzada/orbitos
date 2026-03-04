'use client';

import { useMe, useOrganizations, useServers } from "@/lib/hooks";
import { logout } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Shield, Crown, Star, User2, CalendarDays, Server, Building2,
    LogOut, Copy, Check, ExternalLink, Zap, Bot
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

const PLAN_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    FREE: { label: "Free", color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: <User2 className="w-3 h-3" /> },
    PRO: { label: "Pro", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <Star className="w-3 h-3" /> },
    ENTERPRISE: { label: "Enterprise", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: <Crown className="w-3 h-3" /> },
    MAX: { label: "Max", color: "text-violet-400 bg-violet-400/10 border-violet-400/20", icon: <Zap className="w-3 h-3" /> },
};

const ROLE_META: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: "Super Admin", color: "text-red-400 bg-red-400/10 border-red-400/20" },
    ADMIN: { label: "Admin", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
    STAFF: { label: "Staff", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    USER: { label: "Usuário", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
};

function CopyBadge({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group">
            <span className="truncate max-w-[160px]">{value}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <Copy className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
    );
}

export default function ProfilePage() {
    const { data: user, isLoading } = useMe();
    const { data: orgs } = useOrganizations();
    const { data: servers } = useServers();

    const avatarUrl = user?.avatar
        ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=256`
        : null;

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'long' })
        : '—';

    const role = user?.role || 'USER';
    const roleMeta = ROLE_META[role] || ROLE_META.USER;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="text-sm">Carregando perfil...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
                <p className="text-muted-foreground text-sm mt-1">Informações da sua conta e organizações vinculadas.</p>
            </div>

            {/* ── Cartão principal ── */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                {/* Banner gradient */}
                <div className="h-24 bg-gradient-to-r from-violet-900/60 via-blue-900/40 to-emerald-900/30 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.3),transparent_60%)]" />
                </div>

                <div className="px-6 pb-6">
                    {/* Avatar + info principal */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                        <Avatar className="w-20 h-20 border-4 border-card ring-2 ring-border/50 shadow-xl shrink-0">
                            <AvatarImage src={avatarUrl || undefined} />
                            <AvatarFallback className="bg-violet-600/20 text-violet-300 text-2xl font-bold">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 pb-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h2 className="text-xl font-bold truncate">{user?.username || 'Usuário'}</h2>
                                <Badge className={`text-[10px] font-bold border px-2 py-0.5 w-fit ${roleMeta.color}`}>
                                    <Shield className="w-2.5 h-2.5 mr-1" />
                                    {roleMeta.label}
                                </Badge>
                            </div>
                            {user?.email && (
                                <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300 shrink-0"
                            onClick={() => logout()}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sair
                        </Button>
                    </div>

                    <Separator className="my-4" />

                    {/* Grid de infos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Discord ID</p>
                            <CopyBadge value={user?.discordId || '—'} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Membro desde</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {joinedDate}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Servidores</p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Server className="w-3.5 h-3.5" />
                                {servers?.length || 0} conectados
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Organizações ── */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-sm">Organizações</h3>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">{orgs?.length || 0}</Badge>
                    </div>
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Configurações
                        </Button>
                    </Link>
                </div>

                {!orgs?.length ? (
                    <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                        Nenhuma organização criada ainda.
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {orgs.map(org => {
                            const plan = PLAN_META[org.plan] || PLAN_META.FREE;
                            return (
                                <div key={org.id} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400 shrink-0">
                                        {org.name[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{org.name}</p>
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{org.id}</p>
                                    </div>
                                    <Badge className={`text-[10px] font-bold border px-2 py-0.5 gap-1 shrink-0 ${plan.color}`}>
                                        {plan.icon}
                                        {plan.label}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Conta Discord ── */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Conta Discord Vinculada</h3>
                </div>
                <div className="px-6 py-4 flex items-center gap-4">
                    <Avatar className="w-10 h-10 border border-border/50">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-[#5865F2]/20 text-[#5865F2]">
                            {user?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{user?.username}</p>
                        <p className="text-[11px] text-muted-foreground">ID: {user?.discordId}</p>
                    </div>
                    <Badge className="text-[10px] text-emerald-400 bg-emerald-400/10 border-emerald-400/20 border gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Conectado
                    </Badge>
                </div>
            </div>
        </div>
    );
}
