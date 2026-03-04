'use client';

import { useMe, useOrganizations, useServers } from "@/lib/hooks";
import { logout } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Shield, Crown, Star, User2, CalendarDays, Server,
    LogOut, Copy, Check, ExternalLink, Zap, Building2,
    Wifi, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PLAN_META: Record<string, { label: string; gradient: string; icon: React.ReactNode }> = {
    FREE: { label: "Free", gradient: "from-slate-500/20 to-slate-600/10 border-slate-500/20 text-slate-300", icon: <User2 className="w-3 h-3" /> },
    PRO: { label: "Pro", gradient: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-300", icon: <Star className="w-3 h-3" /> },
    ENTERPRISE: { label: "Enterprise", gradient: "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-300", icon: <Crown className="w-3 h-3" /> },
    MAX: { label: "Max", gradient: "from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-300", icon: <Zap className="w-3 h-3" /> },
};

const ROLE_META: Record<string, { label: string; color: string; dot: string }> = {
    SUPER_ADMIN: { label: "Super Admin", color: "text-red-400", dot: "bg-red-400" },
    ADMIN: { label: "Admin", color: "text-orange-400", dot: "bg-orange-400" },
    STAFF: { label: "Staff", color: "text-blue-400", dot: "bg-blue-400" },
    USER: { label: "Usuário", color: "text-slate-400", dot: "bg-slate-400" },
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="flex flex-col gap-1.5 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
            <div className="text-muted-foreground/60">{icon}</div>
            <span className="text-xl font-bold text-foreground">{value}</span>
            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">{label}</span>
        </div>
    );
}

function CopyField({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Copiado!");
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.06] transition-colors">
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-0.5">{label}</p>
                <p className="text-sm font-mono text-muted-foreground truncate">{value}</p>
            </div>
            <button onClick={copy} className="ml-3 p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground/40 hover:text-muted-foreground transition-all shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
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
        ? new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    const role = user?.role || 'USER';
    const roleMeta = ROLE_META[role] || ROLE_META.USER;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 animate-spin" />
                    </div>
                    <span className="text-sm">Carregando perfil...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Hero Card ── */}
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-card">
                {/* Gradiente de fundo */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
                    <div className="absolute -top-10 right-0 w-48 h-48 bg-blue-600/15 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-1/2 w-64 h-32 bg-emerald-600/10 rounded-full blur-3xl -translate-x-1/2" />
                </div>

                <div className="relative p-6 sm:p-8">
                    <div className="flex items-start gap-5">
                        {/* Avatar com anel animado */}
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 opacity-60 blur-sm" />
                            <Avatar className="relative w-20 h-20 border-2 border-white/10">
                                <AvatarImage src={avatarUrl || undefined} />
                                <AvatarFallback className="bg-violet-900/60 text-violet-200 text-2xl font-black">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            {/* Badge online */}
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-white/10">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                            </div>
                        </div>

                        {/* Info principal */}
                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl font-black tracking-tight truncate">{user?.username || 'Usuário'}</h1>
                                <span className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider", roleMeta.color)}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", roleMeta.dot)} />
                                    {roleMeta.label}
                                </span>
                            </div>
                            {user?.email && (
                                <p className="text-sm text-muted-foreground/70 mt-1 truncate">{user.email}</p>
                            )}

                            <div className="flex items-center gap-3 mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="w-3 h-3" />
                                    Sair
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-6">
                        <StatCard icon={<Building2 className="w-4 h-4" />} label="Orgs" value={orgs?.length || 0} />
                        <StatCard icon={<Server className="w-4 h-4" />} label="Servidores" value={servers?.length || 0} />
                        <StatCard icon={<CalendarDays className="w-4 h-4" />} label="Desde" value={joinedDate} />
                    </div>
                </div>
            </div>

            {/* ── Conta Discord ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.05]">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/50">Identificadores</p>
                </div>
                <div className="p-4 space-y-2">
                    <CopyField label="Discord ID" value={user?.discordId || '—'} />
                    {user?.email && <CopyField label="E-mail" value={user.email} />}
                </div>
            </div>

            {/* ── Organizações ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/50">Organizações</p>
                        <span className="text-[10px] bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-full font-bold text-muted-foreground">{orgs?.length || 0}</span>
                    </div>
                    <Link href="/dashboard/settings">
                        <button className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-1 transition-colors uppercase tracking-wider font-semibold">
                            Gerenciar <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                    </Link>
                </div>

                {!orgs?.length ? (
                    <div className="px-5 py-10 text-center">
                        <Building2 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground/50">Nenhuma organização criada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {orgs.map(org => {
                            const plan = PLAN_META[org.plan] || PLAN_META.FREE;
                            return (
                                <div key={org.id} className="px-4 py-3.5 flex items-center gap-3.5 hover:bg-white/[0.02] transition-colors group">
                                    {/* Ícone org */}
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-violet-500/20 flex items-center justify-center text-base font-black text-violet-300 shrink-0">
                                        {org.name[0]?.toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm leading-tight truncate">{org.name}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground/40 truncate mt-0.5">
                                            {org.id.substring(0, 8)}…
                                        </p>
                                    </div>

                                    <Badge className={cn("text-[10px] font-bold border px-2.5 py-0.5 gap-1 shrink-0 bg-transparent", plan.gradient)}>
                                        {plan.icon}
                                        {plan.label}
                                    </Badge>

                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Conexão Discord ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-card p-4 flex items-center gap-4">
                <Avatar className="w-11 h-11 border border-[#5865F2]/30 shrink-0">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-[#5865F2]/20 text-[#5865F2] font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.username}</p>
                    <p className="text-[11px] text-muted-foreground/50 font-mono">@{user?.discordId}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full shrink-0">
                    <Wifi className="w-3 h-3" />
                    Conectado
                </div>
            </div>

        </div>
    );
}
