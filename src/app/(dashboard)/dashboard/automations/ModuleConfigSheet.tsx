'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateModuleConfig, useResetModuleConfig } from '@/lib/hooks';
import { toast } from 'sonner';
import { RefreshCcw, Sparkles, AlertCircle, Plus, Trash2, LayoutDashboard, Database, Activity, Gauge, BarChart, ShieldCheck, MessageSquare, Zap, Megaphone, Gamepad2, Landmark, Gavel, History, TrendingUp, Users, DollarSign, Clock, HelpCircle, ChevronRight, BookOpen, Check, Circle, X, Shield, Gift, UserPlus, Volume2, Layout, UserCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/language-provider';

interface ModuleConfigSheetProps {
    isOpen: boolean;
    onClose: () => void;
    module: any;
    organizationId: string;
}

const DEFAULT_WHITELIST_QUIZ_QUESTIONS = [
    {
        id: 'quiz-default-1',
        text: 'RDM (matar sem motivo) e permitido?',
        options: ['Nao, e proibido', 'Sim, sempre', 'Somente com admin online'],
        correctAnswer: 0,
    },
    {
        id: 'quiz-default-2',
        text: 'O que fazer antes de entrar em acao policial?',
        options: ['Abrir chamada e comunicar no RP', 'Atirar primeiro', 'Ignorar as regras'],
        correctAnswer: 0,
    },
    {
        id: 'quiz-default-3',
        text: 'Metagaming significa:',
        options: ['Usar informacoes de fora do jogo no RP', 'Dirigir devagar', 'Abrir ticket no Discord'],
        correctAnswer: 0,
    },
    {
        id: 'quiz-default-4',
        text: 'Em caso de duvida sobre regra, qual o correto?',
        options: ['Consultar staff/abrir ticket', 'Inventar regra na hora', 'Sair do servidor'],
        correctAnswer: 0,
    },
    {
        id: 'quiz-default-5',
        text: 'Powergaming e:',
        options: ['Forcar acoes impossiveis sem chance de reacao', 'Jogar em equipe', 'Respeitar cooldown'],
        correctAnswer: 0,
    },
];

function withWhitelistQuizDefaults(moduleKey: string, incoming: any) {
    if (moduleKey !== 'whitelist_quiz') return incoming || {};

    const next = { ...(incoming || {}) };
    const hasQuestions = Array.isArray(next.questions) && next.questions.length > 0;

    if (!hasQuestions) {
        next.questions = DEFAULT_WHITELIST_QUIZ_QUESTIONS.map((q) => ({
            ...q,
            options: [...q.options],
        }));
    }

    if (typeof next.passPercentage !== 'number' || Number.isNaN(next.passPercentage)) {
        next.passPercentage = 80;
    }

    if (typeof next.autoApprove !== 'boolean') {
        next.autoApprove = true;
    }

    return next;
}

export function ModuleConfigSheet({ isOpen, onClose, module, organizationId }: ModuleConfigSheetProps) {
    const updateConfig = useUpdateModuleConfig(organizationId);
    const resetConfig = useResetModuleConfig(organizationId);
    const [config, setConfig] = useState<any>(module?.config || {});

    useEffect(() => {
        if (module?.config) {
            setConfig(withWhitelistQuizDefaults(module?.key, module.config));
        } else {
            setConfig(withWhitelistQuizDefaults(module?.key, {}));
        }
    }, [module]);

    useEffect(() => {
        if (!isOpen || module?.key !== 'whitelist_quiz') return;

        const hasQuestions = Array.isArray(config?.questions) && config.questions.length > 0;
        if (hasQuestions) return;

        setConfig((prev: any) => withWhitelistQuizDefaults('whitelist_quiz', prev || {}));
    }, [isOpen, module?.key, config?.questions]);

    const handleSave = async () => {
        try {
            await updateConfig.mutateAsync({
                moduleKey: module.key,
                config
            });
            toast.success('Configuração salva com sucesso!');
            onClose();
        } catch (error) {
            toast.error('Erro ao salvar configuração.');
        }
    };

    const handleReset = async () => {
        try {
            const data = await resetConfig.mutateAsync(module.key);
            // O backend retorna o objeto OrganizationModule atualizado
            setConfig(withWhitelistQuizDefaults(module?.key, data.config || {}));
            toast.success('Configuração restaurada para o padrão da comunidade!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Este módulo não possui predefinições para sua comunidade.');
        }
    };

    if (!module) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-7xl h-[94vh] mt-[3vh] p-10 bg-slate-950 border-slate-800 text-slate-200 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent rounded-t-[40px] shadow-2xl overflow-y-auto">
                <SheetHeader className="pb-8 border-b border-slate-800/50 mb-6">
                    <div className="flex items-center gap-2 text-violet-400 mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Configuração de Módulo</span>
                    </div>
                    <SheetTitle className="text-2xl font-bold text-white">Configurar: {module.name}</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Ajuste as preferências do módulo para otimizar sua comunidade.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
                    <div className="lg:col-span-7 space-y-10">
                        {/* Botão de Preset/Dica */}
                        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-violet-300">Usar Predefinição</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed">Aplique uma configuração otimizada e testada para o seu tipo de servidor.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-violet-500/5 hover:bg-violet-500/20 border-violet-500/30 gap-2 shrink-0 text-violet-300 h-8"
                                onClick={handleReset}
                                disabled={resetConfig.isPending}
                            >
                                <RefreshCcw className={cn("h-3 w-3", resetConfig.isPending && "animate-spin")} />
                                Restaurar
                            </Button>
                        </div>

                        {/* Guia de Configuração Refinado */}
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                                <div className="flex items-center gap-2 text-violet-400">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Guia de Configuração & Fluxo</span>
                                </div>
                                <div className="space-y-3">
                                    {module.key === 'level_system' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Seus membros ganham XP ao interagir. O sistema gerencia níveis e pode entregar cargos automaticamente.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Exemplo de Uso:</p>
                                                <p className="text-[10px] text-slate-400">XP Multiplier: <code className="text-slate-200">1.2</code> (20% de bônus). Use <code className="text-slate-200">/rank</code> para ver o progresso.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'welcome_message' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Envie mensagens automáticas quando novos membros entrarem. Suporta embeds e variáveis dinâmicas.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica de Variáveis:</p>
                                                <p className="text-[10px] text-slate-400">Use <code className="text-slate-200">{"{user}"}</code> para mencionar e <code className="text-slate-200">{"{guild}"}</code> para o nome do servidor.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'ticket' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Sistema de atendimento profissional. Crie canais privados entre membros e sua equipe de suporte.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Exemplo de Setup:</p>
                                                <p className="text-[10px] text-slate-400">ID Categoria: <code className="text-slate-200">1021...</code> | Cargo Staff: <code className="text-slate-200">821...</code></p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'autorole' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Entrega cargos instantaneamente assim que um membro entra no servidor.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Exemplo:</p>
                                                <p className="text-[10px] text-slate-400">IDs: <code className="text-slate-200">1023..., 1024...</code> (Membro, Visitante)</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'anti_raid' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Protege contra ataques de bots e "joins" em massa. Entra em modo de segurança automaticamente.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Recomendação:</p>
                                                <p className="text-[10px] text-slate-400">Threshold: <code className="text-slate-200">5-10</code> mem/seg. Action: <code className="text-slate-200">LOCKDOWN</code>.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'giveaway' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Gerencie sorteios profissionais. Use <code className="text-violet-400">/giveaway start</code> para iniciar.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Exemplo:</p>
                                                <p className="text-[10px] text-slate-400">Requerimento: <code className="text-slate-200">Cargo VIP</code>. Canal: <code className="text-slate-200">#sorteios</code>.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'suggestion' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Permita que membros enviem ideias com votação pública por reações.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica:</p>
                                                <p className="text-[10px] text-slate-400">Ative o anonimato para sugestões mais sinceras.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'rules_accept' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Exija que membros aceitem as regras para ganhar acesso ao servidor.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica:</p>
                                                <p className="text-[10px] text-slate-400">Use <code className="text-slate-200">/panel rules</code> para enviar a mensagem.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'verification' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Proteção contra bots com verificação por botão ou captcha simples.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica:</p>
                                                <p className="text-[10px] text-slate-400">Use <code className="text-slate-200">/panel verify</code> no seu canal de recepção.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'advanced_verification' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Exige que o usuário vincule uma conta externa (ex: GitHub, Steam) para provar sua identidade antes de entrar.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica:</p>
                                                <p className="text-[10px] text-slate-400">Preencha o <strong className="text-slate-300">Canal de Verificação</strong> para o bot enviar o painel automaticamente quando um membro entrar.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'report' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Sistema de denúncias centralizado para sua staff.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica:</p>
                                                <p className="text-[10px] text-slate-400">Jogadores usam <code className="text-slate-200">/report</code> para denunciar abusos.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'application' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Formulários de recrutamento e whitelist integrados.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica:</p>
                                                <p className="text-[10px] text-slate-400">Use <code className="text-slate-200">/apply</code> para iniciar um formulário.</p>
                                            </div>
                                        </>
                                    )}
                                    {module.key === 'whitelist' && (
                                        <>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                Controle de acesso manual ou por ID de jogador.
                                            </p>
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                                <p className="text-[9px] font-bold text-violet-400 uppercase mb-1">💡 Dica:</p>
                                                <p className="text-[10px] text-slate-400">Ative para garantir que apenas membros aprovados entrem no jogo.</p>
                                            </div>
                                        </>
                                    )}
                                    {!['welcome_message', 'ticket', 'level_system', 'autorole', 'anti_raid', 'giveaway', 'suggestion', 'rules_accept', 'verification', 'report', 'application', 'whitelist'].includes(module.key) && (
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Configure os campos abaixo e utilize os comandos de painel <code className="text-violet-400">/panel [modulo]</code> no Discord para ativar a interface visual.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {module.key === 'welcome_message' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                                            <Sparkles className="h-5 w-5 text-pink-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Boas-vindas (Embed)</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Personalização de Entrada</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Envio (ID)</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-pink-400"
                                                placeholder="Ex: 1021810593236516930"
                                                value={config.channelId || ''}
                                                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Título do Anúncio</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 text-xs text-white"
                                                value={config.title || 'Seja bem-vindo!'}
                                                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Descrição (Markdown)</Label>
                                            <textarea
                                                className="w-full min-h-[100px] bg-slate-950 border-slate-800 rounded-lg p-3 text-xs text-slate-400 focus:border-pink-500 outline-none transition-all"
                                                value={config.description || ''}
                                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                            />
                                            <div className="flex gap-1.5 flex-wrap">
                                                {['{user}', '{guild}', '{memberCount}'].map(tag => (
                                                    <span key={tag} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">{tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cor do Embed</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        className="h-9 bg-slate-950 border-slate-800 text-[10px] font-mono"
                                                        value={config.color || '#F472B6'}
                                                        onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                                    />
                                                    <div className="w-10 h-9 rounded bg-slate-950 border border-slate-800" style={{ backgroundColor: config.color || '#F472B6' }} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-end">
                                                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Mencionar?</span>
                                                    <Switch
                                                        className="data-[state=checked]:bg-pink-500"
                                                        checked={config.mentionUser || false}
                                                        onCheckedChange={(checked) => setConfig({ ...config, mentionUser: checked })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Layout className="h-3 w-3 text-pink-400" />
                                                <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Imagens & Branding</h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">URL da Imagem (Banner)</Label>
                                                    <Input
                                                        className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                                        placeholder="https://... (link direto .png ou .jpg)"
                                                        value={config.imageUrl || ''}
                                                        onChange={(e) => setConfig({ ...config, imageUrl: e.target.value })}
                                                    />
                                                    <p className="text-[9px] text-slate-500 italic">💡 Use links diretos (terminados em .png, .jpg ou .gif).</p>
                                                    
                                                    {config.imageUrl && (
                                                        <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950/50 aspect-video flex items-center justify-center">
                                                            <img 
                                                                src={config.imageUrl} 
                                                                alt="Preview" 
                                                                className="max-h-full max-w-full object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                                                <Layout className="h-8 w-8 text-slate-500" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Posição da Imagem</Label>
                                                    <select
                                                        className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-slate-400 outline-none focus:border-pink-500 transition-all"
                                                        value={config.imagePosition || 'bottom'}
                                                        onChange={(e) => setConfig({ ...config, imagePosition: e.target.value })}
                                                    >
                                                        <option value="bottom">Banner Largo (Rodapé)</option>
                                                        <option value="top">Miniatura (Topo Direita)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Texto do Rodapé (Footer)</Label>
                                                <Input
                                                    className="h-9 bg-slate-950 border-slate-800 text-xs text-slate-400"
                                                    placeholder="OrbitOS • Experiência Exclusiva"
                                                    value={config.footer || ''}
                                                    onChange={(e) => setConfig({ ...config, footer: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'autorole' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                            <UserPlus className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Auto-Cargo (AutoRole)</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Atribuição Instantânea</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargos Iniciais (IDs)</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-indigo-400"
                                                placeholder="Ex: 82181059444, 102181059..."
                                                value={config.roleIds?.join(', ') || ''}
                                                onChange={(e) => setConfig({ ...config, roleIds: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                                            />
                                            <p className="text-[9px] text-slate-600 italic">Separe múltiplos IDs por vírgula.</p>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ignorar Bots</Label>
                                                <p className="text-[9px] text-slate-500 italic">Prevenção contra spam de robôs.</p>
                                            </div>
                                            <Switch
                                                className="data-[state=checked]:bg-indigo-500"
                                                checked={config.ignoreBots !== false}
                                                onCheckedChange={(checked) => setConfig({ ...config, ignoreBots: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'ticket' && (
                                <div className="space-y-6">
                                    {/* Cabeçalho do Módulo */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <MessageSquare className="h-5 w-5 text-orange-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-200">Central de Suporte</h3>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-tight">Configurações Avançadas</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs font-bold px-4 rounded-lg transition-all"
                                            onClick={handleSave}
                                        >
                                            <Zap className="h-3 w-3 mr-1.5 fill-current" /> SALVAR
                                        </Button>
                                    </div>

                                    {/* Configuração de IDs de Canais e Cargos */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ID da Categoria</Label>
                                            <Input
                                                className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                                placeholder="Ex: 1021..."
                                                value={config.categoryId || ''}
                                                onChange={(e) => setConfig({ ...config, categoryId: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-600 italic">Onde os canais serão criados.</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo Staff (ID)</Label>
                                            <Input
                                                className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                                placeholder="Ex: 1021810593..."
                                                value={config.staffRoleId || ''}
                                                onChange={(e) => setConfig({ ...config, staffRoleId: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-600 italic">Quem pode ver os tickets.</p>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal do Painel (ID)</Label>
                                        <Input
                                            className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                            placeholder="Ex: 8218105..."
                                            value={config.channelId || ''}
                                            onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-600 italic">Onde o botão de abrir ticket será enviado pelo comando `/painel`.</p>
                                    </div>

                                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Logs (ID)</Label>
                                        <Input
                                            className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                            placeholder="Ex: 1021..."
                                            value={config.logsChannelId || ''}
                                            onChange={(e) => setConfig({ ...config, logsChannelId: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-600 italic">Arquivos de conversa (transcripts) serão enviados aqui.</p>
                                    </div>

                                    {/* Painel de Atendimento */}
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <Label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Painel de Atendimento (Enterprise)</Label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Título do Painel</Label>
                                                <Input
                                                    className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                                    placeholder="Sistema de Ticket"
                                                    value={config.panelTitle || ''}
                                                    onChange={(e) => setConfig({ ...config, panelTitle: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Banner do Menu (URL)</Label>
                                                <Input
                                                    className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                                    placeholder="https://..."
                                                    value={config.panelBanner || ''}
                                                    onChange={(e) => setConfig({ ...config, panelBanner: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Descrição do Painel</Label>
                                            <textarea
                                                className="w-full min-h-[60px] bg-slate-950 border-slate-800 rounded-lg p-2 text-[11px] text-slate-400 focus:border-orange-500 outline-none transition-all"
                                                placeholder="Para obter suporte, selecione a opção abaixo..."
                                                value={config.panelDescription || ''}
                                                onChange={(e) => setConfig({ ...config, panelDescription: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Departamentos/Categorias */}
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <Label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Opções do Menu</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[10px] text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                                                onClick={() => {
                                                    const current = Array.isArray(config.ticketCategories) ? config.ticketCategories : [];
                                                    const parsedCats = current.map((c: any) => typeof c === 'string' ? { name: c, description: 'Selecione para atendimento.', emoji: '🎫' } : c);
                                                    setConfig({ ...config, ticketCategories: [...parsedCats, { name: 'Nova Opção', description: 'Selecione para abrir.', emoji: '📩' }] });
                                                }}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> ADICIONAR
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                onClick={() => {
                                                    setConfig({
                                                        ...config,
                                                        ticketCategories: [
                                                            { name: 'Dúvidas Gerais', description: 'Perguntas sobre o servidor e regras.', emoji: '❓' },
                                                            { name: 'Denúncias', description: 'Reportar jogadores ou comportamentos.', emoji: '⚖️' },
                                                            { name: 'Financeiro / Loja', description: 'Problemas com compras ou doações.', emoji: '💳' },
                                                            { name: 'Parcerias', description: 'Solicitação de parcerias e mídia.', emoji: '🚀' }
                                                        ]
                                                    });
                                                    toast.info('Exemplo de departamentos carregado!');
                                                }}
                                            >
                                                <History className="h-3 w-3 mr-1" /> CARREGAR EXEMPLO
                                            </Button>
                                        </div>

                                        <div className="grid gap-3">
                                            {Array.isArray(config.ticketCategories) && config.ticketCategories.map((cat: any, idx: number) => {
                                                const catObj = typeof cat === 'string' ? { name: cat, description: '', emoji: '🎫' } : cat;
                                                return (
                                                    <div key={idx} className="flex flex-col gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg group">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                className="h-7 w-12 bg-slate-900 border-none text-center text-xs text-slate-300 focus-visible:ring-1 focus-visible:ring-orange-500 px-1"
                                                                value={catObj.emoji || ''}
                                                                placeholder="🎫"
                                                                onChange={(e) => {
                                                                    const newCats = [...config.ticketCategories];
                                                                    newCats[idx] = { ...catObj, emoji: e.target.value };
                                                                    setConfig({ ...config, ticketCategories: newCats });
                                                                }}
                                                            />
                                                            <Input
                                                                className="h-7 flex-1 bg-slate-900 border-none font-bold text-xs text-slate-200 focus-visible:ring-1 focus-visible:ring-orange-500 px-2"
                                                                value={catObj.name || ''}
                                                                placeholder="Nome (Ex: Dúvidas)"
                                                                onChange={(e) => {
                                                                    const newCats = [...config.ticketCategories];
                                                                    newCats[idx] = { ...catObj, name: e.target.value };
                                                                    setConfig({ ...config, ticketCategories: newCats });
                                                                }}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-slate-600 hover:text-red-400 transition-colors"
                                                                onClick={() => {
                                                                    const newCats = config.ticketCategories.filter((_: any, i: number) => i !== idx);
                                                                    setConfig({ ...config, ticketCategories: newCats });
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <Input
                                                            className="h-6 bg-transparent border-t border-slate-800/50 rounded-none text-[10px] text-slate-400 focus-visible:ring-0 px-1 placeholder-slate-600 mt-1"
                                                            value={catObj.description || ''}
                                                            placeholder="Descrição que aparece no menu..."
                                                            onChange={(e) => {
                                                                const newCats = [...config.ticketCategories];
                                                                newCats[idx] = { ...catObj, description: e.target.value };
                                                                setConfig({ ...config, ticketCategories: newCats });
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Opções de Fluxo */}
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 group hover:border-orange-500/40 transition-all">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">Transcripts (Logs)</Label>
                                                <p className="text-[10px] text-slate-500 italic">Salva o histórico do chat ao fechar.</p>
                                            </div>
                                            <Switch
                                                className="data-[state=checked]:bg-orange-500"
                                                checked={config.transcriptsEnabled !== false}
                                                onCheckedChange={(checked) => setConfig({ ...config, transcriptsEnabled: checked })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">Limite de Tickets</Label>
                                                <p className="text-[10px] text-slate-500 italic">Máximo por usuário (Recomendado: 1).</p>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-8 w-16 bg-slate-950 border-slate-800 text-center font-bold text-orange-400"
                                                value={config.maxTicketsPerUser || 1}
                                                onChange={(e) => setConfig({ ...config, maxTicketsPerUser: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem de Boas-vindas</Label>
                                        <textarea
                                            className="w-full min-h-[80px] bg-slate-950 border-slate-800 rounded-lg p-2 text-[11px] text-slate-400 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Olá {user}, como podemos ajudar?"
                                            value={config.welcomeMessage || ''}
                                            onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                        />
                                        <p className="text-[9px] text-slate-600">Marcadores: {'{user}'}, {'{staff}'}, {'{id}'}</p>
                                    </div>

                                    {/* 👑 Premium Branding */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 space-y-4">
                                        <div className="flex items-center gap-2 mb-2 border-b border-violet-500/20 pb-2">
                                            <Sparkles className="h-4 w-4 text-violet-400" />
                                            <h4 className="text-xs font-bold text-violet-300 uppercase tracking-widest">Premium Branding (Pro/Ent)</h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cor do Embed (Hex)</Label>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-md border border-slate-700"
                                                        style={{ backgroundColor: config.embedColor || '#FFA500' }}
                                                    />
                                                    <Input
                                                        className="flex-1 h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-300"
                                                        placeholder="#FFA500"
                                                        value={config.embedColor || ''}
                                                        onChange={(e) => setConfig({ ...config, embedColor: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Footer Text</Label>
                                                <Input
                                                    className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-300"
                                                    placeholder="Sua marca aqui"
                                                    value={config.footerText || ''}
                                                    onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">URL do Banner</Label>
                                                <Input
                                                    className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-300"
                                                    placeholder="https://..."
                                                    value={config.bannerUrl || ''}
                                                    onChange={(e) => setConfig({ ...config, bannerUrl: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Posição da Imagem</Label>
                                                <select
                                                    className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-slate-300 outline-none"
                                                    value={config.imagePosition || 'bottom'}
                                                    onChange={(e) => setConfig({ ...config, imagePosition: e.target.value })}
                                                >
                                                    <option value="bottom">Larga (Rodapé)</option>
                                                    <option value="top">Miniatura (Topo Direita)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-2 border-t border-violet-500/10">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Enviar DM ao Abrir Ticket</Label>
                                                <Switch
                                                    className="data-[state=checked]:bg-violet-600"
                                                    checked={config.sendDmOnOpen === true}
                                                    onCheckedChange={(checked) => setConfig({ ...config, sendDmOnOpen: checked })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem Direta (DM)</Label>
                                                <textarea
                                                    className="w-full min-h-[60px] bg-slate-900/50 border-slate-800 rounded-lg p-2 text-[11px] text-slate-400 focus:border-violet-500 outline-none transition-all"
                                                    placeholder="Olá {user}, seu ticket {id} foi criado em {guild}."
                                                    value={config.dmMessage || ''}
                                                    onChange={(e) => setConfig({ ...config, dmMessage: e.target.value })}
                                                />
                                                <p className="text-[9px] text-slate-500">Marcadores: {'{user}'}, {'{id}'}, {'{guild}'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'level_system' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                            <TrendingUp className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Engajamento & XP</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Gamificação da Comunidade</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        {/* Canal de notificação de level-up */}
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Level-Up</Label>
                                            <Input
                                                placeholder="ID do canal (ex: 1021307...)"
                                                className="h-9 bg-slate-950 border-slate-800 text-xs font-mono"
                                                value={config.rankChannelId || ''}
                                                onChange={(e) => setConfig({ ...config, rankChannelId: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-600 italic">Onde o bot anuncia os level-ups. Se vazio, anuncia no canal onde o membro falou.</p>
                                        </div>

                                        {/* Multiplicador de XP */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Multiplicador de XP</Label>
                                                <span className="text-xs font-bold text-indigo-400">x{config.xpMultiplier || 1.0}</span>
                                            </div>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                max="10"
                                                className="h-9 bg-slate-950 border-slate-800 text-xs text-indigo-400 font-bold"
                                                value={config.xpMultiplier || 1.0}
                                                onChange={(e) => setConfig({ ...config, xpMultiplier: parseFloat(e.target.value) })}
                                            />
                                            <p className="text-[9px] text-slate-600 italic">15–25 XP por mensagem (cooldown 1 min). Multiplique para boostar XP.</p>
                                        </div>

                                        {/* Mensagem de level-up customizada */}
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem de Level-Up</Label>
                                            <textarea
                                                rows={2}
                                                placeholder="Parabéns {user}, você chegou no nível {level}! 🎉"
                                                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 p-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                value={config.levelUpMessage || ''}
                                                onChange={(e) => setConfig({ ...config, levelUpMessage: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-600 italic">Variáveis: <code className="text-slate-400">{'{user}'}</code> e <code className="text-slate-400">{'{level}'}</code></p>
                                        </div>

                                        {/* XP em Voz */}
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-emerald-500/80 uppercase">XP em Voz</Label>
                                                <p className="text-[9px] text-slate-500 italic">Ganha XP em calls.</p>
                                            </div>
                                            <Switch
                                                className="data-[state=checked]:bg-emerald-500"
                                                checked={config.voiceXpEnabled !== false}
                                                onCheckedChange={(checked) => setConfig({ ...config, voiceXpEnabled: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'anti_raid' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <Gavel className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Proteção Anti-Raid</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Segurança Automatizada</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Limite de Entradas (Threshold)</Label>
                                                <span className="text-xs font-bold text-red-400">{config.threshold || 5} membros/s</span>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-9 bg-slate-950 border-slate-800 text-xs text-red-400 font-bold"
                                                value={config.threshold || 5}
                                                onChange={(e) => setConfig({ ...config, threshold: parseInt(e.target.value) })}
                                            />
                                            <p className="text-[9px] text-slate-600 italic">Dispara a proteção se muitos membros entrarem simultaneamente.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ação de Segurança</Label>
                                            <select
                                                className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 px-3 text-xs text-slate-300 focus:border-red-500 outline-none transition-all"
                                                value={config.action || 'LOCKDOWN'}
                                                onChange={(e) => setConfig({ ...config, action: e.target.value })}
                                            >
                                                <option value="LOCKDOWN">🔐 LOCKDOWN (Bloquear Servidor)</option>
                                                <option value="ALERT">⚠️ APENAS AVISAR STAFF</option>
                                                <option value="KICK">👢 KICK AUTOMÁTICO</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'suggestion' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <Megaphone className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Sistema de Sugestões</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Feedback da Comunidade</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Sugestões (ID)</Label>
                                        <Input
                                            className="h-9 bg-slate-900 border-slate-700 font-mono text-xs"
                                            placeholder="Ex: 821..."
                                            value={config.channelId || ''}
                                            onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                                        />
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sugestões Anônimas</Label>
                                                <p className="text-[9px] text-slate-500 italic">Oculta o autor da sugestão no embed.</p>
                                            </div>
                                            <Switch
                                                className="data-[state=checked]:bg-yellow-500"
                                                checked={config.anonymous || false}
                                                onCheckedChange={(checked) => setConfig({ ...config, anonymous: checked })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-bold text-emerald-500 uppercase">Emoji Upvote</Label>
                                                <Input className="h-8 bg-slate-950 border-slate-800 text-center text-sm" value={config.upvoteEmoji || '👍'} onChange={(e) => setConfig({ ...config, upvoteEmoji: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-bold text-red-500 uppercase">Emoji Downvote</Label>
                                                <Input className="h-8 bg-slate-950 border-slate-800 text-center text-sm" value={config.downvoteEmoji || '👎'} onChange={(e) => setConfig({ ...config, downvoteEmoji: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'rules_accept' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <BookOpen className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Aceitação de Regras</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Onboarding de Membros</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Regras (ID)</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" value={config.channelId || ''} onChange={(e) => setConfig({ ...config, channelId: e.target.value })} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo Pós-Regras (ID)</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" value={config.roleId || ''} onChange={(e) => setConfig({ ...config, roleId: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Texto das Regras (Markdown)</Label>
                                        <textarea
                                            className="w-full min-h-[200px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 focus:border-blue-500 outline-none transition-all scrollbar-thin"
                                            placeholder="Defina as regras do seu servidor aqui..."
                                            value={config.rules || ''}
                                            onChange={(e) => setConfig({ ...config, rules: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {module.key === 'advanced_verification' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <ShieldCheck className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Verificação Avançada</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Verificação por Site Externo</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Verificação (ID)</Label>
                                            <Input
                                                className="h-9 bg-slate-900 border-slate-800 font-mono text-xs"
                                                placeholder="Ex: 1021810593236516930"
                                                value={config.channelId || ''}
                                                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-500">Canal onde o bot envia o painel quando um membro entra.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo de Verificado (ID) *</Label>
                                            <Input
                                                className="h-9 bg-slate-900 border-slate-800 font-mono text-xs text-blue-300"
                                                placeholder="Ex: 1234567890123456789"
                                                value={config.requiredRole || ''}
                                                onChange={(e) => setConfig({ ...config, requiredRole: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-500">Cargo que o membro recebe ao concluir a verificação. <strong className="text-slate-400">Obrigatório.</strong></p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">URL do Site de Verificação <span className="text-slate-600 normal-case font-normal">(opcional)</span></Label>
                                        <Input
                                            className="h-9 bg-slate-900 border-slate-800 font-mono text-xs text-blue-400"
                                            placeholder="https://seusite.com/verificar"
                                            value={config.url || ''}
                                            onChange={(e) => setConfig({ ...config, url: e.target.value })}
                                        />
                                        <p className="text-[9px] text-slate-500">Se preenchida, aparece botão de link + botão ✅ "Já verifiquei" para atribuir o cargo.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem do Painel <span className="text-slate-600 normal-case font-normal">(opcional)</span></Label>
                                        <textarea
                                            className="w-full min-h-[80px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 focus:border-blue-500 outline-none transition-all"
                                            placeholder="⚙️ Sistema de proteção contra BOTs. Clique abaixo para confirmar que você não é um robô."
                                            value={config.message || ''}
                                            onChange={(e) => setConfig({ ...config, message: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem de Boas-vindas <span className="text-slate-600 normal-case font-normal">(opcional)</span></Label>
                                        <textarea
                                            className="w-full min-h-[80px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Olá {user} 👋\n» Verificação concluída!\nSeja bem-vindo(a) à comunidade!"
                                            value={config.welcomeMessage || ''}
                                            onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                        />
                                        <p className="text-[9px] text-slate-500">Texto exibido no embed após a verificação. Se vazio, usa o texto padrão da plataforma. Suporta <strong className="text-slate-400">{'{'}user{'}'}</strong> para mencionar o membro.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Banner da Mensagem de Boas-vindas <span className="text-slate-600 normal-case font-normal">(opcional)</span></Label>
                                        <Input
                                            className="h-9 bg-slate-900 border-slate-800 font-mono text-xs text-purple-300"
                                            placeholder="https://i.imgur.com/seuBanner.png"
                                            value={config.bannerUrl || ''}
                                            onChange={(e) => setConfig({ ...config, bannerUrl: e.target.value })}
                                        />
                                        <p className="text-[9px] text-slate-500">Imagem exibida no embed de boas-vindas quando o membro conclui a verificação.</p>
                                    </div>
                                </div>
                            )}

                            {module.key === 'verification' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <Check className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Verificação de Membros</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Filtro de Bots & Segurança</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Verificação</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" value={config.channelId || ''} onChange={(e) => setConfig({ ...config, channelId: e.target.value })} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo de Verificado</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" value={config.roleId || ''} onChange={(e) => setConfig({ ...config, roleId: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem do Botão (Embed)</Label>
                                        <textarea
                                            className="w-full min-h-[100px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Clique no botão abaixo para se verificar..."
                                            value={config.message || ''}
                                            onChange={(e) => setConfig({ ...config, message: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem de Boas-vindas <span className="text-slate-600 normal-case font-normal">(opcional)</span></Label>
                                        <textarea
                                            className="w-full min-h-[80px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Olá {user} 👋\n» Verificação concluída!\nSeja bem-vindo(a) à comunidade!"
                                            value={config.welcomeMessage || ''}
                                            onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                        />
                                        <p className="text-[9px] text-slate-500">Texto exibido no embed após a verificação. Se vazio, usa o texto padrão da plataforma. Suporta <strong className="text-slate-400">{'{'}user{'}'}</strong> para mencionar o membro.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Banner da Mensagem de Boas-vindas <span className="text-slate-600 normal-case font-normal">(opcional)</span></Label>
                                        <Input
                                            className="h-9 bg-slate-900 border-slate-800 font-mono text-xs text-purple-300"
                                            placeholder="https://i.imgur.com/seuBanner.png"
                                            value={config.bannerUrl || ''}
                                            onChange={(e) => setConfig({ ...config, bannerUrl: e.target.value })}
                                        />
                                        <p className="text-[9px] text-slate-500">Imagem exibida no embed de boas-vindas quando o membro conclui a verificação.</p>
                                    </div>
                                </div>
                            )}

                            {module.key === 'report' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                            <AlertCircle className="h-5 w-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Centro de Denúncias</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Ouvidoria da Comunidade</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal das Denúncias (ID)</Label>
                                        <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" value={config.channelId || ''} onChange={(e) => setConfig({ ...config, channelId: e.target.value })} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Denúncia Anônima</Label>
                                            <p className="text-[9px] text-slate-500 italic">Permite deletar a mensagem original do autor.</p>
                                        </div>
                                        <Switch
                                            className="data-[state=checked]:bg-orange-500"
                                            checked={config.anonymous || false}
                                            onCheckedChange={(checked) => setConfig({ ...config, anonymous: checked })}
                                        />
                                    </div>
                                </div>
                            )}

                            {module.key === 'application' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                            <Gavel className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Formulário de Recrutamento</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Gestão de Candidaturas</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Resultado</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" placeholder="ID do canal" value={config.channelId || ''} onChange={(e) => setConfig({ ...config, channelId: e.target.value })} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo Pós-Aprovação</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" value={config.applicationRoleId || ''} onChange={(e) => setConfig({ ...config, applicationRoleId: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo Staff (Avaliador)</Label>
                                        <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs text-orange-400" placeholder="ID do cargo Avaliador" value={config.staffRoleId || ''} onChange={(e) => setConfig({ ...config, staffRoleId: e.target.value })} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Perguntas (Uma por linha)</Label>
                                        <textarea
                                            className="w-full min-h-[120px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 focus:border-violet-500 outline-none transition-all"
                                            placeholder="Ex: Qual sua experiência?&#10;Por que devemos te escolher?"
                                            value={Array.isArray(config.questions) ? config.questions.join('\n') : ''}
                                            onChange={(e) => setConfig({ ...config, questions: e.target.value.split('\n').filter(s => s.trim() !== '') })}
                                        />
                                    </div>
                                </div>
                            )}

                            {module.key === 'store_panel' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <DollarSign className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Painel da Loja</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Vendas & Produtos</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal da Loja (ID)</Label>
                                        <Input className="h-9 bg-slate-900 border-slate-800 font-mono text-xs" value={config.channelId || ''} onChange={(e) => setConfig({ ...config, channelId: e.target.value })} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Auto-Update</Label>
                                            <p className="text-[9px] text-slate-500 italic">Sincroniza produtos automaticamente.</p>
                                        </div>
                                        <Switch
                                            className="data-[state=checked]:bg-emerald-500"
                                            checked={config.autoUpdate || true}
                                            onCheckedChange={(checked) => setConfig({ ...config, autoUpdate: checked })}
                                        />
                                    </div>
                                </div>
                            )}

                            {['growth_stats', 'engagement_stats', 'revenue_stats', 'activity_stats'].includes(module.key) && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                            <TrendingUp className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Estatísticas & Insights</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Monitoramento Automático</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-300">Coleta de Dados Ativa</Label>
                                                <p className="text-[9px] text-slate-500">Sincroniza dados para os gráficos.</p>
                                            </div>
                                            <Switch checked={config.enabled !== false} onCheckedChange={(enabled) => setConfig({ ...config, enabled })} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal de Transmissão (ID)</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-indigo-400"
                                                value={config.broadcastChannelId || ''}
                                                onChange={(e) => setConfig({ ...config, broadcastChannelId: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Intervalo de Atualização</Label>
                                            <select
                                                className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 px-3 text-xs text-slate-300 focus:border-indigo-500 outline-none transition-all"
                                                value={config.interval || 'DAILY'}
                                                onChange={(e) => setConfig({ ...config, interval: e.target.value })}
                                            >
                                                <option value="HOURLY">⏳ A CADA HORA</option>
                                                <option value="DAILY">📅 DIÁRIO</option>
                                                <option value="WEEKLY">🗓️ SEMANAL</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'whitelist_quiz' && (
                                <div className="space-y-6">
                                    {/* Ações Rápidas no Topo */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-sm z-10 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-violet-600/20 p-2 rounded-lg">
                                                <ShieldCheck className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white tracking-tight">Configuração do Quiz</h3>
                                                <p className="text-[10px] text-slate-500 font-medium">Edição Facilitada</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={updateConfig.isPending}
                                            className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-9 px-4 rounded-lg shadow-lg shadow-violet-500/10"
                                        >
                                            {updateConfig.isPending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : 'Salvar Quiz'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo de Entrada</Label>
                                            <Input
                                                className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-violet-300"
                                                placeholder="ID do Cargo"
                                                value={config.roleId || ''}
                                                onChange={(e) => setConfig({ ...config, roleId: e.target.value })}
                                            />
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mínimo para Passar</Label>
                                                <span className="text-xs font-bold text-emerald-400">{config.passPercentage || 80}%</span>
                                            </div>
                                            <Input
                                                type="number"
                                                className="h-8 bg-slate-950 border-slate-800 text-xs font-bold text-emerald-400"
                                                value={config.passPercentage || 80}
                                                onChange={(e) => setConfig({ ...config, passPercentage: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal do Quiz (ID)</Label>
                                        <Input
                                            className="h-8 bg-slate-950 border-slate-800 font-mono text-xs text-slate-400"
                                            placeholder="Ex: 8218105..."
                                            value={config.channelId || ''}
                                            onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-600 italic">Onde o botão de iniciar será enviado.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <Label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Questões do Quiz</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-violet-500/30 text-violet-400 hover:bg-violet-500/5 text-[11px] font-bold"
                                                onClick={() => {
                                                    const qs = config.questions || [];
                                                    setConfig({
                                                        ...config,
                                                        questions: [...qs, { id: Date.now(), text: '', options: ['', '', ''], correctAnswer: 0 }]
                                                    });
                                                }}
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" /> Nova Pergunta
                                            </Button>
                                        </div>

                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                                            {(config.questions || []).map((q: any, qIdx: number) => (
                                                <div
                                                    key={q.id || qIdx}
                                                    className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="h-6 w-6 shrink-0 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-700">
                                                            {qIdx + 1}
                                                        </div>
                                                        <Input
                                                            className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-white placeholder:text-slate-700 h-6"
                                                            placeholder="Sua pergunta aqui..."
                                                            value={q.text}
                                                            onChange={(e) => {
                                                                const qs = [...config.questions];
                                                                qs[qIdx].text = e.target.value;
                                                                setConfig({ ...config, questions: qs });
                                                            }}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-600 hover:text-red-400"
                                                            onClick={() => {
                                                                const qs = [...config.questions];
                                                                qs.splice(qIdx, 1);
                                                                setConfig({ ...config, questions: qs });
                                                            }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid gap-2 pl-9">
                                                        {q.options.map((opt: string, optIdx: number) => (
                                                            <div
                                                                key={optIdx}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-2 rounded border transition-all",
                                                                    q.correctAnswer === optIdx
                                                                        ? "bg-violet-900/10 border-violet-500/30"
                                                                        : "bg-slate-950 border-slate-800"
                                                                )}
                                                            >
                                                                <button
                                                                    className={cn(
                                                                        "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                                                        q.correctAnswer === optIdx
                                                                            ? "bg-violet-600 border-violet-500 text-white"
                                                                            : "bg-slate-800 border-slate-700 text-slate-500"
                                                                    )}
                                                                    onClick={() => {
                                                                        const qs = [...config.questions];
                                                                        qs[qIdx].correctAnswer = optIdx;
                                                                        setConfig({ ...config, questions: qs });
                                                                    }}
                                                                >
                                                                    {q.correctAnswer === optIdx && <Check className="h-3 w-3 stroke-[3]" />}
                                                                </button>
                                                                <Input
                                                                    className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-[11px] font-medium text-slate-300 placeholder:text-slate-700 h-5"
                                                                    placeholder={`Opção ${optIdx + 1}`}
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const qs = [...config.questions];
                                                                        qs[qIdx].options[optIdx] = e.target.value;
                                                                        setConfig({ ...config, questions: qs });
                                                                    }}
                                                                />
                                                                {q.options.length > 2 && (
                                                                    <button
                                                                        className="text-slate-700 hover:text-red-400 p-1"
                                                                        onClick={() => {
                                                                            const qs = [...config.questions];
                                                                            qs[qIdx].options.splice(optIdx, 1);
                                                                            if (qs[qIdx].correctAnswer >= qs[qIdx].options.length) {
                                                                                qs[qIdx].correctAnswer = 0;
                                                                            }
                                                                            setConfig({ ...config, questions: qs });
                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="ghost"
                                                            className="h-7 text-[10px] font-medium text-slate-500 hover:text-violet-400 gap-1 w-max px-2 hover:bg-violet-400/5 mt-1 border border-dashed border-slate-800"
                                                            onClick={() => {
                                                                const qs = [...config.questions];
                                                                qs[qIdx].options.push('');
                                                                setConfig({ ...config, questions: qs });
                                                            }}
                                                        >
                                                            <Plus className="h-3 w-3" /> Add Alternativa
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-800">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold text-white">Auto-Aprovação</Label>
                                            <p className="text-[10px] text-slate-500">Libera o cargo automaticamente ao passar.</p>
                                        </div>
                                        <Switch
                                            className="data-[state=checked]:bg-violet-600"
                                            checked={config.autoApprove !== false}
                                            onCheckedChange={(checked) => setConfig({ ...config, autoApprove: checked })}
                                        />
                                    </div>
                                </div>
                            )}

                            {module.key === 'whitelist' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <Shield className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Whitelist Tradicional</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Perguntas & Respostas</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo de Aprovado (ID)</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-700 font-mono text-xs" placeholder="Ex: 821..." value={config.roleId || ''} onChange={(e) => setConfig({ ...config, roleId: e.target.value })} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ID do Canal</Label>
                                            <Input className="h-9 bg-slate-900 border-slate-700 font-mono text-xs" placeholder="Ex: 102..." value={config.channelId || ''} onChange={(e) => setConfig({ ...config, channelId: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo de Verificação</Label>
                                            <select
                                                className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 px-3 text-xs text-slate-300 focus:border-blue-500 outline-none transition-all"
                                                value={config.verificationType || 'CODE'}
                                                onChange={(e) => setConfig({ ...config, verificationType: e.target.value })}
                                            >
                                                <option value="CODE">🔢 CÓDIGO (6 dígitos)</option>
                                                <option value="ID">💳 ID DO JOGADOR</option>
                                                <option value="MANUAL">👤 APROVAÇÃO MANUAL</option>
                                            </select>
                                        </div>

                                        {config.verificationType === 'CODE' && (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tamanho do Código</Label>
                                                <Input type="number" className="h-9 bg-slate-950 border-slate-800 text-xs" value={config.codeLength || 6} onChange={(e) => setConfig({ ...config, codeLength: parseInt(e.target.value) })} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Formulário de Entrada (Um por linha)</Label>
                                        <textarea
                                            className="w-full min-h-[120px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Ex: Qual seu ID?&#10;Por que quer entrar?"
                                            value={Array.isArray(config.questions) ? config.questions.join('\n') : ''}
                                            onChange={(e) => setConfig({ ...config, questions: e.target.value.split('\n').filter(s => s.trim() !== '') })}
                                        />
                                    </div>

                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-300">Auto-Aprovação</Label>
                                                <p className="text-[9px] text-slate-500">Libera o cargo automaticamente após o envio.</p>
                                            </div>
                                            <Switch checked={config.autoApprove || false} onCheckedChange={(checked) => setConfig({ ...config, autoApprove: checked })} />
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-300">Sincronização Database</Label>
                                                <p className="text-[9px] text-slate-500">Conexão em tempo real com o servidor.</p>
                                            </div>
                                            <Switch checked={config.syncEnabled || true} onCheckedChange={(checked) => setConfig({ ...config, syncEnabled: checked })} />
                                        </div>
                                    </div>
                                </div>
                            )}                            {module.key === 'giveaway' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <Gift className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Central de Sorteios</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Prêmios & Eventos</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cargo Gerente (ID)</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-amber-500"
                                                placeholder="Quem pode criar sorteios..."
                                                value={config.managerRoleId || ''}
                                                onChange={(e) => setConfig({ ...config, managerRoleId: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Logs Ativos</Label>
                                                <p className="text-[9px] text-slate-500 italic">Registra vencedores no canal de log.</p>
                                            </div>
                                            <Switch
                                                className="data-[state=checked]:bg-amber-500"
                                                checked={config.logsEnabled !== false}
                                                onCheckedChange={(checked) => setConfig({ ...config, logsEnabled: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}



                            {module.key === 'ranking' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <TrendingUp className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Ranking Global</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Competitividade</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo de Ranking</Label>
                                            <select
                                                className="w-full h-9 bg-slate-950 border-slate-800 text-xs rounded-md px-2 text-slate-300"
                                                value={config.type || 'xp'}
                                                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                                            >
                                                <option value="xp">Experiência (XP)</option>
                                                <option value="money">Economia (Dinheiro)</option>
                                                <option value="wins">Vitórias/Kills</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Limite de Jogadores</Label>
                                            <Input
                                                type="number"
                                                className="h-9 bg-slate-950 border-slate-800"
                                                value={config.limit || 10}
                                                onChange={(e) => setConfig({ ...config, limit: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'faction_system' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                            <Users className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Sistema de Facções</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Organizações RP</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Máximo de Membros por Facção</Label>
                                            <Input
                                                type="number"
                                                className="h-9 bg-slate-950 border-slate-800"
                                                value={config.maxMembers || 50}
                                                onChange={(e) => setConfig({ ...config, maxMembers: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                                            <Label className="text-xs font-bold text-slate-300">Banco de Facção Ativo</Label>
                                            <Switch
                                                checked={config.bankEnabled !== false}
                                                onCheckedChange={(checked) => setConfig({ ...config, bankEnabled: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'judicial_system' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                            <Gavel className="h-5 w-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Sistema Judiciário</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Justiça & RP</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ID Cargo Juiz</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-orange-400"
                                                placeholder="ID do Cargo..."
                                                value={config.judgeRoleId || ''}
                                                onChange={(e) => setConfig({ ...config, judgeRoleId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ID Categoria do Tribunal</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-orange-400"
                                                placeholder="ID da Categoria..."
                                                value={config.courtCategoryId || ''}
                                                onChange={(e) => setConfig({ ...config, courtCategoryId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'in_game_logs' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-slate-500/10 border border-slate-500/20">
                                            <Volume2 className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Logs In-Game</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Sincronização FiveM/MC</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">OrbitOS Webhook URL</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 text-xs font-mono text-violet-400"
                                                placeholder="https://..."
                                                value={config.webhookUrl || ''}
                                                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-600">Copie este URL e cole na sua config in-game.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'anti_alt' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <Shield className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Proteção Anti-Alt</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Segurança de Entrada</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Idade Mínima da Conta (Dias)</Label>
                                            <Input
                                                type="number"
                                                className="h-9 bg-slate-950 border-slate-800 text-red-400 font-bold"
                                                value={config.minAccountAge || 30}
                                                onChange={(e) => setConfig({ ...config, minAccountAge: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                                            <Label className="text-xs font-bold text-slate-300">Exigir Foto de Perfil (Avatar)</Label>
                                            <Switch
                                                checked={config.requireAvatar !== false}
                                                onCheckedChange={(checked) => setConfig({ ...config, requireAvatar: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'mod_logs' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                            <History className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Logs de Moderação</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Auditoria e Histórico</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canais de Log (ID)</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs text-violet-400"
                                                placeholder="ID do Canal..."
                                                value={config.logChannelId || ''}
                                                onChange={(e) => setConfig({ ...config, logChannelId: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                                            <Label className="text-xs font-bold text-slate-300">Logar Avisos (Warns)</Label>
                                            <Switch
                                                checked={config.logWarns !== false}
                                                onCheckedChange={(checked) => setConfig({ ...config, logWarns: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'server_status' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <Activity className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Status do Servidor</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Monitoramento em Tempo Real</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Template do Canal</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 text-xs text-emerald-400 font-mono"
                                                placeholder="Ex: 👥 {players} Membros"
                                                value={config.template || '👥 {players} Membros'}
                                                onChange={(e) => setConfig({ ...config, template: e.target.value })}
                                            />
                                            <p className="text-[9px] text-slate-600">Tags: {`{players}`}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ID do Canal</Label>
                                            <Input
                                                className="h-9 bg-slate-950 border-slate-800 font-mono text-xs"
                                                value={config.channelId || ''}
                                                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {module.key === 'coupon' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm mb-2">
                                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                            <Gift className="h-5 w-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-200">Cupons de Desconto</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Regras de Promoção</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Porcentagem de Desconto (%)</Label>
                                            <Input
                                                type="number"
                                                className="h-9 bg-slate-950 border-slate-800 text-rose-400 font-bold"
                                                value={config.discountPercent || 10}
                                                onChange={(e) => setConfig({ ...config, discountPercent: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Limite de Usos por Cupom</Label>
                                            <Input
                                                type="number"
                                                className="h-9 bg-slate-950 border-slate-800 text-white"
                                                value={config.maxUses || 50}
                                                onChange={(e) => setConfig({ ...config, maxUses: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Acumulativo?</Label>
                                                <p className="text-[9px] text-slate-500 italic">Permite usar com outras ofertas.</p>
                                            </div>
                                            <Switch
                                                className="data-[state=checked]:bg-rose-500"
                                                checked={config.stackable || false}
                                                onCheckedChange={(checked) => setConfig({ ...config, stackable: checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!['welcome_message', 'autorole', 'giveaway', 'ticket', 'level_system', 'anti_raid', 'suggestion', 'rules_accept', 'verification', 'advanced_verification', 'report', 'application', 'store_panel', 'growth_stats', 'engagement_stats', 'revenue_stats', 'activity_stats', 'whitelist', 'server_status', 'whitelist_quiz', 'coupon', 'ranking', 'faction_system', 'judicial_system', 'in_game_logs', 'anti_alt', 'mod_logs'].includes(module.key) && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <Database className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Campos Dinâmicos</span>
                                        </div>

                                        {Object.keys(config).length === 0 ? (
                                            <div className="text-center py-6">
                                                <p className="text-xs text-slate-500 italic">Nenhum campo configurado.</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2 text-violet-400 h-7"
                                                    onClick={() => setConfig({ ...config, novo_campo: '' })}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> Adicionar Campo
                                                </Button>
                                            </div>
                                        ) : (
                                            Object.entries(config).map(([key, value]: [string, any]) => (
                                                <div key={key} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-medium text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-600 hover:text-red-400"
                                                            onClick={() => {
                                                                const newConfig = { ...config };
                                                                delete newConfig[key];
                                                                setConfig(newConfig);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    {typeof value === 'boolean' ? (
                                                        <div className="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-700">
                                                            <span className="text-xs text-slate-300">Ativado</span>
                                                            <Switch checked={value} onCheckedChange={(checked) => setConfig({ ...config, [key]: checked })} />
                                                        </div>
                                                    ) : (
                                                        <Input
                                                            className="bg-slate-800 border-slate-700 h-9 text-sm"
                                                            value={value || ''}
                                                            onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                                                        />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-500">
                                            <AlertCircle className="h-3 w-3 inline mr-1" />
                                            Este módulo usa uma interface simplificada baseada nos campos disponíveis.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA DIREITA: GUIA DE ONBOARDING & EXEMPLO */}
                    <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-right-4 duration-500 border-l border-slate-800/50 pl-10">
                        <ModuleOnboarding module={module} />
                    </div>
                </div>

                <SheetFooter className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800">
                    <Button
                        onClick={handleSave}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-violet-500/20"
                        disabled={updateConfig.isPending}
                    >
                        {updateConfig.isPending ? (
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                                Salvando...
                            </div>
                        ) : 'Salvar Alterações'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// --- ONBOARDING COMPONENTS ---

function ModuleOnboarding({ module }: { module: any }) {
    const { t, lang } = useTranslation();
    const modI18n = t.automations.modules[module.key as keyof typeof t.automations.modules] || null;

    if (!modI18n) return (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 border-dashed text-center">
            <HelpCircle className="h-8 w-8 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 italic">Guia de configuração em breve para este módulo.</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Como Funciona */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-violet-400">
                    <Zap className="h-4 w-4" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t.automations.onboarding.how_it_works}</h3>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {modI18n.how_it_works}
                    </p>
                </div>
            </div>

            {/* Chat Simulator */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                    <MessageSquare className="h-4 w-4" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t.automations.onboarding.discord_example}</h3>
                </div>
                <ChatSimulator moduleKey={module.key} />
            </div>

            {/* Como Testar */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t.automations.onboarding.how_to_test}</h3>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <ul className="space-y-3">
                        {modI18n.test_steps.map((step: string, idx: number) => (
                            <li key={idx} className="flex gap-3 text-xs text-slate-400 leading-relaxed">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                                    {idx + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function ChatSimulator({ moduleKey }: { moduleKey: string }) {
    const messages: Record<string, any[]> = {
        ticket: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '📩 **Precisa de ajuda?**\nClique no botão abaixo para abrir um ticket com nossa equipe.', buttons: ['Abrir Ticket'] },
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', action: 'Clicou em [Abrir Ticket]' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🆕 **Ticket criado: #ticket-joaosilva**\nOlá @joaosilva, como podemos te ajudar hoje?' }
        ],
        whitelist: [
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '`/whitelist`' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '👋 **Olá! Iniciando sua Whitelist.**\nQual a sua idade?' },
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '21 anos' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '✅ **Obrigado! Sua resposta foi enviada para análise.**' }
        ],
        welcome_message: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🌟 **Bem-vindo ao servidor, @Jogador!**\nFicamos felizes em ter você aqui. Leia as <#regras> e divirta-se!' }
        ],
        autorole: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', action: 'Atribuiu o cargo [Membro] automaticamente para Jogador' }
        ],
        whitelist_quiz: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🧠 **Pergunta 1/5**\nQual a regra principal sobre RDM?', buttons: ['Proibido', 'Permitido', 'Só com motivo'] },
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', action: 'Clicou em [Proibido]' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '✅ **Correto! Você foi aprovado.**' }
        ],
        giveaway: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🎉 **NOVO SORTEIO!**\nPrêmio: **VIP Diamante (30 dias)**\nBoa sorte a todos!', buttons: ['Participar'] },
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', action: 'Clicou em [Participar]' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🎊 **Sorteio Encerrado!**\nVencedor: @Jogador\nParabéns! Entre em contato com a staff.' }
        ],
        ranking: [
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '`/ranking xp`' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🏆 **Top 3 - Experiência**\n1. @TheBest (Level 99)\n2. @Lucky (Level 85)\n3. @Jogador (Level 42)' }
        ],
        poll: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '📊 **ENQUETE: Qual o próximo evento?**', buttons: ['Guerra de Facções', 'Corrida de Carros', 'Torneio de PVP'] },
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', action: 'Votou em [Guerra de Facções]' }
        ],
        report: [
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '`/report` @Infrator "Uso de hack"' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🛡️ **Denúncia enviada!**\nA staff analisará o caso em breve.' }
        ],
        application: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '📝 **Recrutamento - Polícia**\nResponda as perguntas abaixo...', action: 'Enviou formulário via DM' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '✅ **Staff:** @Jogador foi aprovado!' }
        ],
        level_system: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🆙 **Parabéns @Jogador!**\nVocê acabou de subir para o **Nível 5**!' }
        ],
        anti_raid: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', action: 'Ativou modo de segurança: 50 bots expulsos em 1 minuto.' }
        ],
        suggestion: [
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '`/sugerir` "Adicionar novos carros"' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '💡 **Sugestão de @Jogador**\n"Adicionar novos carros"', buttons: ['✅ Apoio', '❌ Não apoio'] }
        ],
        rules_accept: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '📜 **Regras do Servidor**\nLeia tudo antes de entrar.', buttons: ['✅ Aceitar Regras'] },
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', action: 'Clicou em [Aceitar Regras]' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '✨ **Bem-vindo!** Você agora tem acesso total.' }
        ],
        verification: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🛡️ **Verificação Sugerida**\nClique no botão abaixo para provar que você é humano.', buttons: ['Verificar'] },
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', action: 'Clicou em [Verificar]' }
        ],
        store_panel: [
            { type: 'user', user: 'Jogador', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '`/loja`' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🛒 **Loja OrbitOS**\nEscolha uma categoria...', buttons: ['Iniciais', 'VIPs', 'Dinheiro IC'] }
        ],
        faction_system: [
            { type: 'user', user: 'Líder', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '`/faccao recrutar` @Jogador' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🏴 **Facção: Cartel de Cali**\n@Líder convidou @Jogador para o grupo.', buttons: ['Aceitar', 'Recusar'] }
        ],
        server_status: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', action: 'Atualizou canal de voz: 👥 Membros: 1.254' }
        ],
        growth_stats: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '📈 **Relatório de Crescimento**\nNovos membros hoje: **+42**' }
        ],
        engagement_stats: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '💬 **Resumo de Atividade**\nCanal mais ativo: <#geral>' }
        ],
        revenue_stats: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '💰 **Balanço Financeiro**\nVendas hoje: **R$ 450,00**' }
        ],
        activity_stats: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🎙️ **Estatísticas de Voz**\nMédia em call: **12 membros**' }
        ],
        judicial_system: [
            { type: 'user', user: 'Advogado', avatar: 'https://i.imgur.com/wLhX2sy.png', content: '`/processo` abrir @Infrator "Desacato"' },
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '⚖️ **Novo Processo Judicial: #082**\nJuiz: @JuizDesignado' }
        ],
        in_game_logs: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🎮 **Log In-Game (FiveM)**\n`[MATAR]` @Assassino matou @Vitima com `AK-47`' }
        ],
        anti_alt: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', action: 'Bloqueou entrada: @FakeAccount (Conta recente)' }
        ],
        mod_logs: [
            { type: 'bot', user: 'OrbitOS', avatar: 'https://i.imgur.com/8Km9tLL.png', content: '🔨 **Ação de Moderação**\nPor: @Staff' }
        ]
    };

    const activeMessages = messages[moduleKey as keyof typeof messages] || [];

    if (activeMessages.length === 0) return null;

    return (
        <div className="rounded-xl bg-[#2b2d31] border border-[#1e1f22] overflow-hidden shadow-2xl">
            <div className="bg-[#1e1f22] px-3 py-1.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="text-[10px] font-bold text-slate-500 ml-2">#chat-discord</span>
            </div>
            <div className="p-4 space-y-4">
                {activeMessages.map((msg, idx) => (
                    <div key={idx} className="flex gap-3 group animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                            <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white hover:underline cursor-pointer">{msg.user}</span>
                                {msg.type === 'bot' && <span className="bg-indigo-500 text-[9px] font-bold text-white px-1 rounded uppercase flex items-center">BOT</span>}
                                <span className="text-[9px] text-slate-500">Hoje às 10:42</span>
                            </div>
                            {msg.action ? (
                                <p className="text-[10px] text-slate-400 italic">*{msg.action}*</p>
                            ) : (
                                <div className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">
                                    {msg.content}
                                </div>
                            )}
                            {msg.buttons && (
                                <div className="flex gap-2 mt-2">
                                    {msg.buttons.map((btn: string) => (
                                        <div key={btn} className="bg-[#4e5058] hover:bg-[#6d6f78] text-white text-[10px] font-semibold px-3 py-1 rounded transition-colors cursor-pointer">
                                            {btn}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

