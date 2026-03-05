'use client';

import React, { useState } from 'react';
import { useModules, useToggleModule, useOrganizations, useServers } from '@/lib/hooks';
import {
    Bot,
    Sparkles,
    CheckCircle2,
    Circle,
    Settings2,
    Search,
    MessageSquare,
    Zap,
    Shield,
    DollarSign,
    Gamepad2,
    Users,
    BarChart3,
    AlertTriangle,
    Activity,
    Server as ServerIcon,
    ShieldCheck,
    ShieldAlert,
    BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ModuleConfigSheet } from './ModuleConfigSheet';
import Link from 'next/link';
import { useActiveOrg } from '@/lib/use-org-store';

const categoryIcons: Record<string, any> = {
    'Onboarding': MessageSquare,
    'Support': Settings2,
    'Engagement': Users,
    'Monetization': DollarSign,
    'Security': Shield,
    'Automation': Zap,
    'Game Integration': Gamepad2,
    'Analytics': BarChart3
};

export default function AutomationsPage() {
    const { data: orgs } = useOrganizations();
    const { activeOrgId } = useActiveOrg();
    const currentOrg = orgs?.find(o => o.id === activeOrgId) || orgs?.[0];
    const organizationId = currentOrg?.id;

    const { data: modulesData, isLoading } = useModules(organizationId || '');
    const { data: servers } = useServers();
    const toggleModule = useToggleModule(organizationId || '');

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [selectedModule, setSelectedModule] = useState<any>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const handleConfigClick = (mod: any) => {
        setSelectedModule(mod);
        setIsConfigOpen(true);
    };

    const activeServers = servers?.filter(s => {
        if (!s.isActive) return false;
        // Se não tem lastSeenAt mas isActive=true, considera online (sincronização manual)
        if (!s.lastSeenAt) return true;
        const lastSeen = new Date(s.lastSeenAt).getTime();
        const now = new Date().getTime();
        // Janela de 10 minutos (heartbeat a cada 60s, tolerância para rede lenta)
        return Math.abs(now - lastSeen) < 600000;
    }) || [];
    const isBotOnline = activeServers.length > 0;

    if (!organizationId) return null;

    const modules = modulesData?.modules || [];
    const communityType = modulesData?.communityType || 'general';

    const categories = ['Todos', ...Array.from(new Set(modules.map(m => m.category)))];

    const filteredModules = modules.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'Todos' || m.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleToggle = async (moduleKey: string, active: boolean) => {
        try {
            await toggleModule.mutateAsync({ moduleKey, active: !active });
            toast.success(`${!active ? 'Módulo ativado' : 'Módulo desativado'} com sucesso!`);
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Erro ao alterar status do módulo.');
        }
    };

    const recommendedKeys = communityType === 'game'
        ? ['whitelist', 'server_status', 'ticket']
        : ['welcome_message', 'ticket', 'level_system'];
    const recommendedModules = modules.filter(m => recommendedKeys.includes(m.key));
    const currentModule = selectedModule ? modules.find((m: any) => m.key === selectedModule.key) : null;
    // Read plan from API response (modulesData) or fallback to org
    const plan = (modulesData?.plan || (currentOrg as any)?.plan || 'FREE').toUpperCase();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent inline-block">
                        Bots &amp; Automação
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie os módulos e recursos do seu bot global OrbitOS.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
                    {/* Plan Badge */}
                    <div className={cn(
                        "flex flex-col items-end px-4 py-2 rounded-xl border transition-all shadow-sm bg-card/50",
                        plan === 'MAX'
                            ? "border-rose-500/20 text-rose-400"
                            : plan === 'ENTERPRISE'
                                ? "border-amber-500/20 text-amber-400"
                                : plan === 'PRO'
                                    ? "border-violet-500/20 text-violet-400"
                                    : "border-slate-500/20 text-slate-400"
                    )}>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Plano Atual</p>
                        <p className="text-sm font-black flex items-center gap-1.5 uppercase font-mono">
                            {plan}
                            {plan !== 'FREE'
                                ? <ShieldCheck className="h-3 w-3" />
                                : <ShieldAlert className="h-3 w-3" />
                            }
                        </p>
                    </div>

                    {/* Bot Status */}
                    <div className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all shadow-sm",
                        isBotOnline
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/5 border-amber-500/20 text-amber-400"
                    )}>
                        <div className="relative">
                            <Bot className="h-5 w-5" />
                            {isBotOnline && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-900" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Status Cloud</p>
                            <p className="text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                {isBotOnline ? 'OrbitOS Online' : 'Aguardando Invite'}
                                {isBotOnline
                                    ? <Activity className="h-3 w-3 animate-pulse" />
                                    : <AlertTriangle className="h-3 w-3" />
                                }
                            </p>
                        </div>
                        <Link href="/dashboard/servers" className="ml-2">
                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-white/5">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Upgrade Banner (FREE plan only) */}
            {plan === 'FREE' && (
                <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-600/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0 border border-violet-600/30">
                            <Sparkles className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-violet-300">Upgrade para o Plano PRO ou ENTERPRISE</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Desbloqueie todos os módulos avançados, suporte prioritário e capacidade ilimitada.
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard/billing">
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 h-9 px-6 font-bold shadow-lg shadow-violet-900/20 shrink-0">
                            Ver Planos
                        </Button>
                    </Link>
                </div>
            )}

            {/* Documentation Section */}
            <div className="bg-card/30 border border-violet-500/20 rounded-2xl p-6 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <BookOpen className="h-32 w-32 text-violet-500" />
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2 text-violet-400 font-bold">
                        <BookOpen className="h-5 w-5" />
                        <h2>Guia de Configuração OrbitOS</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">1. Ativação</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Escolha os módulos na lista abaixo e clique no interruptor. O bot sincroniza instantaneamente com sua nuvem.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">2. Variáveis</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Em mensagens de texto use: <code className="text-violet-400">{"{user}"}</code> para menção, <code className="text-violet-400">{"{guild}"}</code> para servidor e <code className="text-violet-400">{"{memberCount}"}</code> para estatísticas.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">3. IDs de Canais</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Para obter o ID de um canal/cargo, ative o Modo Desenvolvedor no seu Discord e clique com o botão direito sobre o item.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">4. Comandos /panel</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Após configurar aqui, use <code className="text-violet-400">/panel [modulo]</code> no Discord para enviar as interfaces interativas aos canais.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bot Offline Warning */}
            {!isBotOnline && !isLoading && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                            <ServerIcon className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-amber-400">O Bot OrbitOS está offline no seu servidor</p>
                            <p className="text-xs text-muted-foreground max-w-lg mt-0.5">
                                Convide nosso bot oficial ou verifique se ele tem permissões de Administrador para que as automações funcionem corretamente.
                            </p>
                        </div>
                    </div>
                    <a
                        href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1357217419260596425'}&permissions=8&scope=bot+applications.commands`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 h-9 px-6 font-bold shadow-lg shadow-amber-900/20 shrink-0">
                            Convidar OrbitOS
                        </Button>
                    </a>
                </div>
            )}

            {/* Recommendations Section */}
            {activeCategory === 'Todos' && !search && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-violet-400 font-semibold">
                        <Sparkles className="h-4 w-4" />
                        <h2>Recomendado para sua comunidade ({communityType})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendedModules.map((m) => {
                            const Icon = categoryIcons[m.category] || Bot;
                            return (
                                <div
                                    key={m.key}
                                    className="bg-card border border-border/50 rounded-xl p-6 relative overflow-hidden group hover:border-violet-500/50 transition-all shadow-sm"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Icon className="h-16 w-16" />
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-lg">{m.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-6 flex-1">
                                            {m.description}
                                        </p>
                                        <Button
                                            variant={m.active ? "outline" : "default"}
                                            className={cn("w-full h-10", !m.active && "bg-violet-600 hover:bg-violet-500 text-white")}
                                            onClick={() => m.active ? handleConfigClick(m) : handleToggle(m.key, m.active)}
                                            disabled={toggleModule.isPending}
                                        >
                                            {m.active ? 'Configurar' : 'Ativar Agora'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Explorer Section */}
            <div className="space-y-6 pt-4 border-t border-border/50">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <h2 className="text-xl font-bold">Explorar Módulos</h2>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar módulo..."
                                className="pl-9 bg-card border-border/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                                activeCategory === cat
                                    ? "bg-violet-500/10 border-violet-500/50 text-violet-400"
                                    : "bg-card border-border/50 text-muted-foreground hover:border-border"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-xl bg-card border border-border/50 animate-pulse" />
                        ))
                    ) : filteredModules.length > 0 ? (
                        filteredModules.map((m) => (
                            <div
                                key={m.key}
                                className="bg-card border border-border/50 rounded-xl p-5 hover:border-violet-500/30 transition-all group shadow-sm flex items-start gap-4"
                            >
                                <div className={cn(
                                    "shrink-0 h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                                    m.active ? "bg-violet-500/10 text-violet-400" : "bg-muted text-muted-foreground"
                                )}>
                                    {categoryIcons[m.category]
                                        ? React.createElement(categoryIcons[m.category], { className: "h-5 w-5" })
                                        : <Bot className="h-5 w-5" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-semibold truncate">{m.name}</h3>
                                        <button
                                            onClick={() => handleToggle(m.key, m.active)}
                                            disabled={toggleModule.isPending}
                                            className="shrink-0"
                                        >
                                            {m.active ? (
                                                <CheckCircle2 className="h-5 w-5 text-violet-500 fill-violet-500/10" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-muted-foreground/30 hover:text-muted-foreground transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {m.description}
                                    </p>
                                    {m.active && (
                                        <button
                                            onClick={() => handleConfigClick(m)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mt-3 hover:text-violet-300 transition-colors flex items-center gap-1"
                                        >
                                            <Settings2 className="h-3 w-3" />
                                            Configurar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
                            <p className="text-muted-foreground">Nenhum módulo encontrado com estes filtros.</p>
                        </div>
                    )}
                </div>
            </div>

            <ModuleConfigSheet
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                module={currentModule}
                organizationId={organizationId}
            />
        </div>
    );
}
