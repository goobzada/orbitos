'use client';

import { useState } from 'react';
import {
    useAutomations,
    useAutomationTriggers,
    useAutomationActions,
    useCreateAutomation,
    useUpdateAutomation,
    useDeleteAutomation,
    useToggleAutomation,
    useTestAutomation,
    useOrganizations,
    useServers,
} from '@/lib/hooks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useActiveOrg } from '@/lib/use-org-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectValue,
    SelectTrigger,
} from '@/components/ui/select';
import {
    Zap, Plus, Trash2, PlayCircle, Power, PowerOff,
    ChevronRight, ArrowRight, Settings2, Activity,
    CheckCircle2, XCircle, Clock, Bot, AlertTriangle, Loader2,
    FlaskConical, Code2, Cpu, Layers,
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────
interface Action {
    driver: string;
    type: string;
    params: Record<string, string>;
}

interface Condition {
    field: string;
    op: string;
    value: string;
}

const EMPTY_FORM = {
    name: '',
    description: '',
    serverId: '',
    trigger: '',
    conditions: [] as Condition[],
    actions: [] as Action[],
    isActive: true,
};

// ─── Card de Automação ─────────────────────────────────────
function AutomationCard({
    automation,
    onEdit,
    onToggle,
    onDelete,
    onTest,
}: {
    automation: any;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
    onTest: () => void;
}) {
    const lastLog = automation.logs?.[0];
    const logCount = automation._count?.logs || 0;

    return (
        <div className={cn(
            'group bg-card border rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg',
            automation.isActive
                ? 'border-violet-500/30 shadow-violet-500/5'
                : 'border-border/50 opacity-70'
        )}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                        automation.isActive ? 'bg-violet-500/10' : 'bg-muted'
                    )}>
                        <Zap className={cn('h-5 w-5', automation.isActive ? 'text-violet-400' : 'text-muted-foreground')} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{automation.name}</h3>
                        {automation.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{automation.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-violet-400 hover:bg-violet-500/10" onClick={onTest} title="Testar">
                        <FlaskConical className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" onClick={onEdit} title="Editar">
                        <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-400 hover:bg-rose-500/10" onClick={onDelete} title="Excluir">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Flow */}
            <div className="flex items-center gap-2 text-xs bg-secondary/50 rounded-lg px-3 py-2 mb-4">
                <span className="text-violet-400 font-mono font-semibold truncate">{automation.trigger}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground truncate">
                    {(() => {
                        try {
                            const acts = JSON.parse(automation.actions || '[]');
                            return `${acts.length} ação${acts.length !== 1 ? 'ões' : ''}`;
                        } catch { return '—'; }
                    })()}
                </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {lastLog ? (
                        <>
                            {lastLog.status === 'SUCCESS'
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                : <XCircle className="h-3.5 w-3.5 text-rose-500" />
                            }
                            <span>{logCount} execuções</span>
                        </>
                    ) : (
                        <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>Nunca executado</span>
                        </>
                    )}
                </div>
                <button
                    onClick={onToggle}
                    className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                        automation.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                >
                    {automation.isActive
                        ? <><Power className="h-3 w-3" /> Ativa</>
                        : <><PowerOff className="h-3 w-3" /> Pausada</>
                    }
                </button>
            </div>
        </div>
    );
}

// ─── Builder Dialog ───────────────────────────────────────
function AutomationBuilderDialog({
    open,
    onClose,
    editData,
    organizationId,
    servers,
    triggers,
    availableActions,
}: {
    open: boolean;
    onClose: () => void;
    editData?: any;
    organizationId: string;
    servers: any[];
    triggers: any[];
    availableActions: any[];
}) {
    const isEdit = !!editData?.id;
    const [form, setForm] = useState(() => {
        if (editData?.id) {
            return {
                name: editData.name || '',
                description: editData.description || '',
                serverId: editData.serverId || '',
                trigger: editData.trigger || '',
                conditions: editData.conditions ? JSON.parse(editData.conditions) : [],
                actions: editData.actions ? JSON.parse(editData.actions) : [],
                isActive: editData.isActive ?? true,
            };
        }
        return { ...EMPTY_FORM };
    });

    const createMutation = useCreateAutomation(organizationId);
    const updateMutation = useUpdateAutomation(organizationId);
    const isPending = createMutation.isPending || updateMutation.isPending;

    const selectedTrigger = triggers.find(t => t.value === form.trigger);

    const addAction = () => {
        setForm(f => ({
            ...f,
            actions: [...f.actions, { driver: 'discord', type: 'send_message', params: {} }]
        }));
    };

    const removeAction = (i: number) => {
        setForm(f => ({ ...f, actions: f.actions.filter((_a: Action, idx: number) => idx !== i) }));
    };

    const updateAction = (i: number, key: string, value: string) => {
        setForm(f => {
            const actions = [...f.actions];
            if (key === '_type') {
                const found = availableActions.find(a => a.value === value);
                actions[i] = { driver: found?.driver || 'discord', type: found?.type || value, params: {} };
            } else {
                actions[i] = { ...actions[i], params: { ...actions[i].params, [key]: value } };
            }
            return { ...f, actions };
        });
    };

    const addCondition = () => {
        setForm(f => ({ ...f, conditions: [...f.conditions, { field: '', op: 'eq', value: '' }] }));
    };

    const removeCondition = (i: number) => {
        setForm(f => ({ ...f, conditions: f.conditions.filter((_c: Condition, idx: number) => idx !== i) }));
    };

    const updateCondition = (i: number, key: string, value: string) => {
        setForm(f => {
            const conditions = [...f.conditions];
            conditions[i] = { ...conditions[i], [key]: value };
            return { ...f, conditions };
        });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.serverId || !form.trigger) {
            toast.error('Nome, servidor e trigger são obrigatórios.');
            return;
        }
        if (form.actions.length === 0) {
            toast.error('Adicione pelo menos uma ação.');
            return;
        }

        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ id: editData.id, ...form });
                toast.success('Automação atualizada!');
            } else {
                await createMutation.mutateAsync(form);
                toast.success('Automação criada com sucesso!');
            }
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Erro ao salvar automação.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Cpu className="h-5 w-5 text-violet-400" />
                        {isEdit ? 'Editar Automação' : 'Criar Nova Automação'}
                    </DialogTitle>
                    <DialogDescription>
                        Configure o gatilho e as ações que serão executadas automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                    {/* Informações Básicas */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-black">1</span>
                            Identificação
                        </h3>
                        <Input
                            placeholder="Nome da automação (ex: Boas-vindas novos membros)"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="bg-secondary/30 border-border/50"
                        />
                        <Input
                            placeholder="Descrição (opcional)"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="bg-secondary/30 border-border/50"
                        />
                        <Select value={form.serverId} onValueChange={v => setForm(f => ({ ...f, serverId: v }))}>
                            <SelectTrigger className="bg-secondary/30 border-border/50">
                                <SelectValue placeholder="Selecionar Servidor..." />
                            </SelectTrigger>
                            <SelectContent>
                                {servers.filter(s => s.isActive).map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Trigger */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-black">2</span>
                            Quando isso acontecer (Trigger)
                        </h3>
                        <Select value={form.trigger} onValueChange={v => setForm(f => ({ ...f, trigger: v }))}>
                            <SelectTrigger className="bg-secondary/30 border-border/50">
                                <SelectValue placeholder="Selecione o gatilho..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(
                                    triggers.reduce((acc: any, t: any) => {
                                        (acc[t.group] = acc[t.group] || []).push(t);
                                        return acc;
                                    }, {})
                                ).map(([group, items]: any) => (
                                    <div key={group}>
                                        <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{group}</div>
                                        {items.map((t: any) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedTrigger && (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedTrigger.fields.map((f: string) => (
                                    <code key={f} className="text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded font-mono">
                                        {'{' + f + '}'}
                                    </code>
                                ))}
                                <span className="text-[10px] text-muted-foreground self-center ml-1">variáveis disponíveis</span>
                            </div>
                        )}
                    </div>

                    {/* Condições */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-black">3</span>
                                Condições (opcional)
                            </span>
                            <button onClick={addCondition} className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-[10px] normal-case tracking-normal">
                                <Plus className="h-3 w-3" /> Adicionar
                            </button>
                        </h3>
                        {form.conditions.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Sem condições — executa sempre que o trigger acontecer.</p>
                        ) : (
                            <div className="space-y-2">
                                {form.conditions.map((cond: Condition, i: number) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="campo (ex: username)"
                                            value={cond.field}
                                            onChange={e => updateCondition(i, 'field', e.target.value)}
                                            className="bg-secondary/30 border-border/50 text-xs h-8 w-36"
                                        />
                                        <Select value={cond.op} onValueChange={v => updateCondition(i, 'op', v)}>
                                            <SelectTrigger className="bg-secondary/30 border-border/50 h-8 w-28 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="eq">é igual a</SelectItem>
                                                <SelectItem value="ne">é diferente de</SelectItem>
                                                <SelectItem value="contains">contém</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="valor"
                                            value={cond.value}
                                            onChange={e => updateCondition(i, 'value', e.target.value)}
                                            className="bg-secondary/30 border-border/50 text-xs h-8 flex-1"
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 shrink-0" onClick={() => removeCondition(i)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-black">4</span>
                                Então executar (Ações)
                            </span>
                            <button onClick={addAction} className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-[10px] normal-case tracking-normal">
                                <Plus className="h-3 w-3" /> Adicionar
                            </button>
                        </h3>
                        {form.actions.length === 0 ? (
                            <div className="border-2 border-dashed border-border/50 rounded-xl py-6 text-center">
                                <p className="text-xs text-muted-foreground">Nenhuma ação adicionada ainda.</p>
                                <button onClick={addAction} className="mt-2 text-xs text-violet-400 hover:text-violet-300">
                                    + Adicionar primeira ação
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {form.actions.map((action: Action, i: number) => {
                                    const actionDef = availableActions.find(a => a.type === action.type || a.value === `${action.driver}.${action.type}`);
                                    return (
                                        <div key={i} className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ação {i + 1}</span>
                                                    {actionDef && <Badge variant="secondary" className="text-[10px] h-4">{actionDef.group}</Badge>}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400 hover:bg-rose-500/10" onClick={() => removeAction(i)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Select
                                                value={availableActions.find(a => a.type === action.type)?.value || ''}
                                                onValueChange={v => updateAction(i, '_type', v)}
                                            >
                                                <SelectTrigger className="bg-background/50 border-border/50 text-xs h-8">
                                                    <SelectValue placeholder="Selecione a ação..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(
                                                        availableActions.reduce((acc: any, a: any) => {
                                                            (acc[a.group] = acc[a.group] || []).push(a);
                                                            return acc;
                                                        }, {})
                                                    ).map(([group, items]: any) => (
                                                        <div key={group}>
                                                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{group}</div>
                                                            {items.map((a: any) => (
                                                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {/* Params dinâmicos */}
                                            {actionDef?.params?.map((param: string) => (
                                                <div key={param}>
                                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">
                                                        {param}
                                                    </label>
                                                    {param === 'content' || param === 'body' ? (
                                                        <Textarea
                                                            placeholder={`{variavel} ou texto fixo`}
                                                            value={action.params?.[param] || ''}
                                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateAction(i, param, e.target.value)}
                                                            className="bg-background/50 border-border/50 text-xs min-h-[60px]"
                                                            rows={3}
                                                        />
                                                    ) : (
                                                        <Input
                                                            placeholder={`{${param}} ou valor fixo`}
                                                            value={action.params?.[param] || ''}
                                                            onChange={e => updateAction(i, param, e.target.value)}
                                                            className="bg-background/50 border-border/50 text-xs h-8"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2 border-t border-border">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</>
                            ) : (
                                <>{isEdit ? 'Salvar Alterações' : 'Criar Automação'}</>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Página Principal ─────────────────────────────────────
export default function AutomationsBuilderPage() {
    const { data: orgs } = useOrganizations();
    const { activeOrgId } = useActiveOrg();
    const currentOrg = orgs?.find(o => o.id === activeOrgId) || orgs?.[0];
    const organizationId = currentOrg?.id || '';

    const { data: automations = [], isLoading } = useAutomations(organizationId);
    const { data: triggers = [] } = useAutomationTriggers();
    const { data: availableActions = [] } = useAutomationActions();
    const { data: serversRaw } = useServers();
    const servers = serversRaw || [];

    const deleteAutomation = useDeleteAutomation(organizationId);
    const toggleAutomation = useToggleAutomation(organizationId);
    const testAutomation = useTestAutomation(organizationId);

    const [builderOpen, setBuilderOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState<any>(null);

    const openCreate = () => {
        setEditingAutomation(null);
        setBuilderOpen(true);
    };

    const openEdit = (a: any) => {
        setEditingAutomation(a);
        setBuilderOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta automação?')) return;
        try {
            await deleteAutomation.mutateAsync(id);
            toast.success('Automação excluída.');
        } catch {
            toast.error('Erro ao excluir automação.');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await toggleAutomation.mutateAsync(id);
        } catch {
            toast.error('Erro ao alterar status.');
        }
    };

    const handleTest = async (id: string, trigger: string) => {
        try {
            await testAutomation.mutateAsync(id);
            toast.success(`Teste do evento '${trigger}' disparado!`, {
                description: 'Verifique os logs da automação em alguns instantes.'
            });
        } catch {
            toast.error('Erro ao disparar teste.');
        }
    };

    const activeCount = automations.filter((a: any) => a.isActive).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        Automation Engine V2
                    </h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                        Crie regras <strong>Se [Evento] → Então [Ação]</strong> totalmente visuais e sem código.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-3 text-xs">
                        <div className="px-3 py-2 bg-card border border-border/50 rounded-xl text-center">
                            <p className="font-black text-lg text-violet-400">{automations.length}</p>
                            <p className="text-muted-foreground">total</p>
                        </div>
                        <div className="px-3 py-2 bg-card border border-emerald-500/20 rounded-xl text-center">
                            <p className="font-black text-lg text-emerald-400">{activeCount}</p>
                            <p className="text-muted-foreground">ativas</p>
                        </div>
                    </div>
                    <Button
                        onClick={openCreate}
                        className="bg-violet-600 hover:bg-violet-700 text-white gap-2 h-10 px-5 shadow-lg shadow-violet-900/30"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Automação
                    </Button>
                </div>
            </div>

            {/* Explainer Banner */}
            <div className="bg-gradient-to-r from-violet-950/50 to-cyan-950/30 border border-violet-500/20 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    {[
                        {
                            icon: Zap,
                            title: '1. Escolha o Gatilho',
                            desc: 'Defina qual evento do sistema (Discord, Tickets, Loja) vai iniciar a automação.'
                        },
                        {
                            icon: Layers,
                            title: '2. Adicione Condições',
                            desc: 'Filtre quando a automação deve rodar com base nos dados do evento (opcional).'
                        },
                        {
                            icon: PlayCircle,
                            title: '3. Configure as Ações',
                            desc: 'Escolha o que o bot fará: enviar mensagem, dar cargo, chamar webhook, e muito mais.'
                        }
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex gap-3">
                            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                                <Icon className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                                <p className="font-bold mb-0.5">{title}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aviso sem servidores ativos */}
            {servers.filter((s: any) => s.isActive).length === 0 && (
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-300">
                        Nenhum servidor Discord ativo encontrado. Conecte um servidor em <a href="/dashboard/servers" className="underline">Servidores</a> antes de criar automações.
                    </p>
                </div>
            )}

            {/* Grid de Automações */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-44 rounded-2xl bg-card border border-border/50 animate-pulse" />
                    ))}
                </div>
            ) : automations.length === 0 ? (
                <div className="border-2 border-dashed border-border/50 rounded-2xl py-20 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                        <Cpu className="h-7 w-7 text-violet-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Nenhuma automação criada</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        Automatize seu servidor Discord em minutos, sem código.
                    </p>
                    <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 mx-auto">
                        <Plus className="h-4 w-4" />
                        Criar Primeira Automação
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automations.map((automation: any) => (
                        <AutomationCard
                            key={automation.id}
                            automation={automation}
                            onEdit={() => openEdit(automation)}
                            onToggle={() => handleToggle(automation.id)}
                            onDelete={() => handleDelete(automation.id)}
                            onTest={() => handleTest(automation.id, automation.trigger)}
                        />
                    ))}
                </div>
            )}

            {/* Builder Dialog */}
            {builderOpen && (
                <AutomationBuilderDialog
                    open={builderOpen}
                    onClose={() => { setBuilderOpen(false); setEditingAutomation(null); }}
                    editData={editingAutomation}
                    organizationId={organizationId}
                    servers={servers}
                    triggers={triggers}
                    availableActions={availableActions}
                />
            )}
        </div>
    );
}
