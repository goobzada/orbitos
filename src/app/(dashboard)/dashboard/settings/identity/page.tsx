'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Type, Layout, Image as ImageIcon, Settings2, Save, Crown,
    Check, RotateCcw, MonitorPlay, X, ArrowRight, Trash2, Move, Code2, Droplet,
    Type as TypographyIcon, Highlighter, MousePointer2, ChevronRight, Sparkles, Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrganizations, useIdentity, useUpdateIdentity } from "@/lib/hooks";
import { useActiveOrg } from "@/lib/use-org-store";
import { toast } from 'sonner';

const PLAN_PRIORITY: Record<string, number> = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
    MAX: 3,
};

const TEMPLATES = [
    { key: 'default-classic', name: 'Classic Dark', plan: 'FREE', emoji: '🆓', description: 'Sidebar clássica, layout limpo e neutro.' },
    { key: 'neon-grid', name: 'Neon Grid', plan: 'PRO', emoji: '💎', description: 'Grid neon para comunidades gamer.' },
    { key: 'minimal-glass', name: 'Minimal Glass', plan: 'PRO', emoji: '🧊', description: 'Top-nav com glassmorphism premium.' },
    { key: 'terminal-dark', name: 'Terminal Dark', plan: 'PRO', emoji: '🖥️', description: 'Estilo CLI para devs e infra.' },
    { key: 'aurora-landing', name: 'Aurora Landing', plan: 'PRO', emoji: '🌌', description: 'Landing de upsell com aurora animada.' },
    { key: 'modular-blocks', name: 'Modular Blocks', plan: 'PRO', emoji: '🧱', description: 'Dashboard em blocos estilo Notion.' },
    { key: 'cosmic-ultra', name: 'Cosmic Ultra', plan: 'MAX', emoji: '🌌', description: 'Deep space exclusivo — partículas e glassmorphism intenso.' },
    { key: 'obsidian-empire', name: 'Obsidian Empire', plan: 'MAX', emoji: '👑', description: 'Dark luxury puro. Dourado, edges afiadas e power-vibes.' },
    { key: 'hologram-pro', name: 'Hologram PRO', plan: 'MAX', emoji: '🔷', description: 'UI holográfica futurista. Cyan neon e efeitos HUD exclusivos.' },
];

interface FormState {
    templateKey: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    navBackground: string;
    navTextColor: string;
    borderColor: string;
    buttonTextColor: string;
    heroTextColor: string;
    cardBackground: string;
    fontFamily: string;
    fontSizeBasePx: number;
    fontWeight: string;
    letterSpacingPx: number;
    borderRadiusPx: number;
    logoUrl: string;
    logoHeightPx: number;
    heroImageUrl: string;
    heroOpacity: number;
    heroPosition: string;
    customCss: string;
    darkModeDefault: boolean;
}

const DEFAULT_FORM: FormState = {
    templateKey: 'default-classic',
    primaryColor: '#F59E0B',
    secondaryColor: '#FBBF24',
    backgroundColor: '#0C0802',
    surfaceColor: '#1A1208',
    textColor: '#FFFBEB',
    navBackground: '#1A1208',
    navTextColor: '#FFFBEB',
    borderColor: '#000000',
    buttonTextColor: '#000000',
    heroTextColor: '#FFFBEB',
    cardBackground: '#1A1208',
    fontFamily: 'Poppins',
    fontSizeBasePx: 13,
    fontWeight: '400',
    letterSpacingPx: 0,
    borderRadiusPx: 9,
    logoUrl: '',
    logoHeightPx: 100,
    heroImageUrl: '',
    heroOpacity: 80,
    heroPosition: '50% 50%',
    customCss: '',
    darkModeDefault: true,
};

const QUICK_THEMES = [
    { p: '#F59E0B', b: '#0C0802', name: 'Amber Glow' },
    { p: '#8B5CF6', b: '#020617', name: 'Royal Purple' },
    { p: '#3B82F6', b: '#0F172A', name: 'Ocean Blue' },
    { p: '#10B981', b: '#064E3B', name: 'Emerald Forest' },
    { p: '#EF4444', b: '#451A03', name: 'Crimson Night' },
    { p: '#F472B6', b: '#2D0616', name: 'Pink Velvet' },
    { p: '#22D3EE', b: '#083344', name: 'Cyber Cyan' },
    { p: '#F97316', b: '#2A0E00', name: 'Solar Orange' },
    { p: '#6366F1', b: '#020617', name: 'Indigo Dream' },
    { p: '#A855F7', b: '#2E1065', name: 'Deep Amethyst' },
    { p: '#14B8A6', b: '#042F2E', name: 'Teal Lagoon' },
    { p: '#FACC15', b: '#422006', name: 'Gold Leaf' },
    { p: '#4ADE80', b: '#064E3B', name: 'Mint Fresh' },
    { p: '#FB7185', b: '#4C0519', name: 'Rose Petal' },
    { p: '#38BDF8', b: '#075985', name: 'Sky High' },
    { p: '#E879F9', b: '#4A044E', name: 'Magenta Madness' },
    { p: '#FFFFFF', b: '#000000', name: 'Pure Contrast' },
    { p: '#94A3B8', b: '#0F172A', name: 'Slate Grey' },
];

export default function IdentityEditorPage() {
    const { activeOrgId } = useActiveOrg();
    const { data: apiOrgs } = useOrganizations();
    const selectedOrg = apiOrgs?.find(o => o.id === activeOrgId);
    const orgId = selectedOrg?.id || "";

    const { data: identityData, isLoading: loadingIdentity } = useIdentity(orgId);
    const updateIdentity = useUpdateIdentity(orgId);

    const [form, setForm] = useState<FormState>(DEFAULT_FORM);
    const [originalForm, setOriginalForm] = useState<FormState | null>(null);
    const [orgPlan, setOrgPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE' | 'MAX'>('FREE');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('template');

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeReady, setIframeReady] = useState(false);
    const [upsellTemplate, setUpsellTemplate] = useState<string | null>(null);

    useEffect(() => {
        if (identityData) {
            const mappedForm: FormState = {
                ...DEFAULT_FORM,
                ...identityData,
                templateKey: identityData.templateKey || identityData.presetKey || DEFAULT_FORM.templateKey,
                borderRadiusPx: identityData.borderRadiusPx || identityData.borderRadius || DEFAULT_FORM.borderRadiusPx,
            };
            setForm(mappedForm);
            setOriginalForm(mappedForm);
        }
        if (selectedOrg) {
            setOrgPlan(selectedOrg.plan as any);
        }
    }, [identityData, selectedOrg]);

    useEffect(() => {
        const onIframeMessage = (e: MessageEvent) => {
            if (e.data?.type === 'PREVIEW_READY') {
                setIframeReady(true);
            }
        };
        window.addEventListener('message', onIframeMessage);
        return () => window.removeEventListener('message', onIframeMessage);
    }, []);

    useEffect(() => {
        if (iframeReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'PREVIEW_UPDATE',
                payload: {
                    form,
                    community: {
                        name: selectedOrg?.name || 'Comunidade Preview',
                        slug: selectedOrg?.slug || 'preview',
                        avatar: form.logoUrl || "https://avatar.vercel.sh/community",
                        description: 'Este preview usa a identidade real da organização selecionada.',
                    }
                }
            }, '*');
        }
    }, [form, iframeReady, selectedOrg]);

    const set = (key: keyof FormState, val: any) => setForm(f => ({ ...f, [key]: val }));

    const handleSave = async () => {
        if (!orgId) return;
        setSaving(true);
        try {
            await updateIdentity.mutateAsync({
                presetKey: form.templateKey,
                ...form,
                borderRadius: form.borderRadiusPx,
            });
            setSaved(true);
            setOriginalForm({ ...form });
            toast.success("Identidade salva com sucesso!");
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 403) {
                setUpsellTemplate(form.templateKey);
                toast.warning("Funcionalidade premium identificada.");
            } else {
                toast.error("Erro ao salvar identidade visual.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => { if (originalForm) setForm(originalForm); };

    const handleTemplateClick = (t: (typeof TEMPLATES)[0]) => {
        const userPriority = PLAN_PRIORITY[orgPlan] || 0;
        const templatePriority = PLAN_PRIORITY[t.plan] || 0;

        if (templatePriority > userPriority) {
            setUpsellTemplate(t.key);
        } else {
            set('templateKey', t.key);
        }
    };

    const applyTheme = (theme: typeof QUICK_THEMES[0]) => {
        setForm(f => ({
            ...f,
            primaryColor: theme.p,
            backgroundColor: theme.b,
            surfaceColor: theme.b + 'CC',
            navBackground: theme.b,
            borderColor: theme.p + '44'
        }));
        toast.info(`Tema "${theme.name}" aplicado!`);
    };

    const isDirty = originalForm && JSON.stringify(form) !== JSON.stringify(originalForm);
    const upsellDetails = TEMPLATES.find(t => t.key === upsellTemplate);

    const TABS = [
        { id: 'template', label: 'Template', Icon: Layout },
        { id: 'colors', label: 'Cores', Icon: Palette },
        { id: 'typography', label: 'Tipos', Icon: TypographyIcon },
        { id: 'identity', label: 'Logo', Icon: Droplet },
        { id: 'hero', label: 'Hero', Icon: ImageIcon },
        { id: 'advanced', label: 'CSS', Icon: Code2 },
    ] as const;

    return (
        <div className="h-full flex flex-col md:flex-row overflow-hidden bg-background">
            <aside className="w-full md:w-[420px] bg-background border-r border-border overflow-y-auto flex flex-col relative z-20 shadow-xl">
                <div className="p-6 pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-30">
                    <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> Design do Portal
                    </h1>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving || !isDirty}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold h-11"
                        >
                            {saved ? <Check className="w-5 h-5 mr-1" /> : <Save className="w-5 h-5 mr-1" />}
                            {saved ? 'Salvo' : saving ? 'Gravando...' : 'Publicar Alterações'}
                        </Button>

                        <button
                            onClick={handleReset}
                            disabled={!isDirty}
                            className="p-3 border border-border bg-card hover:bg-accent rounded-lg text-muted-foreground disabled:opacity-50 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex overflow-x-auto border-b border-border bg-muted/20 scrollbar-hide shrink-0">
                    {TABS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex flex-col items-center gap-1.5 px-6 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all shrink-0 ${activeTab === id
                                ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                                : 'border-transparent text-muted-foreground hover:bg-background'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-8 flex-1 overflow-y-auto pb-20">
                    <AnimatePresence mode="wait">
                        {activeTab === 'template' && (
                            <motion.div key="template" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/50">Arquitetura de Layout</h2>
                                <div className="grid grid-cols-1 gap-3">
                                    {TEMPLATES.map(t => {
                                        const templatePriority = PLAN_PRIORITY[t.plan] || 0;
                                        const userPriority = PLAN_PRIORITY[orgPlan] || 0;
                                        const isLocked = templatePriority > userPriority;
                                        const isActive = form.templateKey === t.key;
                                        return (
                                            <button
                                                key={t.key}
                                                onClick={() => handleTemplateClick(t)}
                                                className={`relative flex items-center p-4 rounded-xl border text-left transition-all ${isActive
                                                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                                    : isLocked
                                                        ? 'border-border/30 bg-card/20 opacity-80'
                                                        : 'border-border bg-card/40 hover:border-amber-500/50'
                                                    }`}
                                            >
                                                <span className="text-2xl mr-4">{t.emoji}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-sm tracking-wide">{t.name}</h3>
                                                        {isLocked && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed uppercase">{t.description}</p>
                                                </div>
                                                {isActive && <Check className="w-4 h-4 text-amber-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'colors' && (
                            <motion.div key="colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Temas Rápidos</h2>
                                    <div className="grid grid-cols-6 gap-2">
                                        {QUICK_THEMES.map((t, i) => (
                                            <button
                                                key={i}
                                                onClick={() => applyTheme(t)}
                                                className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all active:scale-95"
                                                title={t.name}
                                            >
                                                <div className="absolute inset-0 flex flex-col">
                                                    <div className="flex-1" style={{ backgroundColor: t.p }} />
                                                    <div className="flex-[2]" style={{ backgroundColor: t.b }} />
                                                </div>
                                                {form.primaryColor === t.p && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Ajuste Fino</h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { k: 'primaryColor', label: 'Destaque', icon: Highlighter },
                                            { k: 'backgroundColor', label: 'Fundo', icon: Droplet },
                                            { k: 'surfaceColor', label: 'Cards', icon: Layout },
                                            { k: 'textColor', label: 'Texto Geral', icon: Type },
                                            { k: 'navBackground', label: 'Sidebar / Top', icon: MousePointer2 },
                                        ].map(({ k, label, icon: Icon }) => (
                                            <div key={k} className="flex items-center gap-4 bg-card/30 p-3 rounded-xl border border-white/5">
                                                <div className="relative w-12 h-12 rounded-lg border border-white/10 overflow-hidden shadow-inner">
                                                    <input
                                                        type="color"
                                                        value={form[k as keyof FormState] as string}
                                                        onChange={e => set(k as keyof FormState, e.target.value)}
                                                        className="absolute -inset-4 w-[200%] h-[200%] cursor-crosshair"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon className="w-3 h-3 text-muted-foreground" />
                                                        <label className="text-[11px] font-bold uppercase text-muted-foreground">{label}</label>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={form[k as keyof FormState] as string}
                                                        onChange={e => set(k as keyof FormState, e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 text-sm font-mono focus:ring-0 outline-none uppercase text-white/90"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'typography' && (
                            <motion.div key="typography" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Família da Fonte</Label>
                                    <select
                                        value={form.fontFamily}
                                        onChange={e => set('fontFamily', e.target.value)}
                                        className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500/50 outline-none"
                                    >
                                        {['Poppins', 'Inter', 'Outfit', 'Space Grotesk', 'JetBrains Mono', 'Plus Jakarta Sans'].map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-amber-500">Tamanho Base</span>
                                            <span className="text-white bg-white/10 px-2 py-0.5 rounded">{form.fontSizeBasePx}px</span>
                                        </div>
                                        <input
                                            type="range" min={12} max={18} value={form.fontSizeBasePx}
                                            onChange={e => set('fontSizeBasePx', Number(e.target.value))}
                                            className="w-full accent-amber-500"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-amber-500">Cantos (Radius)</span>
                                            <span className="text-white bg-white/10 px-2 py-0.5 rounded">{form.borderRadiusPx}px</span>
                                        </div>
                                        <input
                                            type="range" min={0} max={24} value={form.borderRadiusPx}
                                            onChange={e => set('borderRadiusPx', Number(e.target.value))}
                                            className="w-full accent-amber-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'identity' && (
                            <motion.div key="identity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl bg-card/20 flex flex-col items-center justify-center text-center group hover:border-amber-500/50 transition-colors cursor-pointer relative overflow-hidden">
                                    {form.logoUrl ? (
                                        <img src={form.logoUrl} className="max-h-20 mb-4" alt="Logo Preview" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-muted-foreground mb-4 group-hover:text-amber-500 transition-colors" />
                                    )}
                                    <p className="text-sm font-semibold mb-1">Upload da Logo</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Clique para enviar PNG / SVG</p>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={() => toast.info('Funcionalidade de upload em breve. Use URL por enquanto.')}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Ou use uma URL</Label>
                                    <Input
                                        value={form.logoUrl}
                                        onChange={e => set('logoUrl', e.target.value)}
                                        placeholder="https://sua-logo.png"
                                        className="bg-card/50 border-white/10 rounded-xl h-12"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'hero' && (
                            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div
                                    className="aspect-video rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden group shadow-2xl"
                                    style={{
                                        backgroundImage: form.heroImageUrl ? `url(${form.heroImageUrl})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: form.heroPosition,
                                    }}
                                >
                                    {!form.heroImageUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase font-bold tracking-widest">
                                            Sem Wallpaper
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] text-white bg-white/10 hover:bg-white/20" onClick={() => set('heroImageUrl', '')}>
                                            <Trash2 className="w-3 h-3 mr-2" /> Remover
                                        </Button>
                                        <div className="flex items-center gap-2 text-[10px] text-white font-bold bg-amber-500/80 px-3 py-1 rounded-full border border-white/20">
                                            <Move className="w-3 h-3" /> Arraste para mover
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Wallpaper do Hero (URL)</Label>
                                    <Input
                                        value={form.heroImageUrl}
                                        onChange={e => set('heroImageUrl', e.target.value)}
                                        placeholder="https://exemplo.com/banner.jpg"
                                        className="bg-card/50 border-white/10 rounded-xl h-12"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-amber-500">Opacidade do Overlay</span>
                                        <span className="text-white bg-white/10 px-2 py-0.5 rounded">{form.heroOpacity}%</span>
                                    </div>
                                    <input
                                        type="range" min={0} max={100} value={form.heroOpacity}
                                        onChange={e => set('heroOpacity', Number(e.target.value))}
                                        className="w-full accent-amber-500"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'advanced' && (
                            <motion.div key="advanced" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Custom CSS Overrides</Label>
                                    <span className="text-[9px] text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">Advanced Users</span>
                                </div>
                                <textarea
                                    value={form.customCss}
                                    onChange={e => set('customCss', e.target.value)}
                                    className="w-full h-80 bg-black/50 border border-white/5 rounded-2xl p-4 text-[13px] font-mono text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none scrollbar-thin shadow-inner"
                                    placeholder="/* .card { border: 2px solid gold; animation: ... } */"
                                />
                                <p className="text-[10px] text-muted-foreground uppercase leading-tight italic">
                                    * Use com cuidado. Estilos injetados diretamente no Header do portal.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            <main className="flex-1 relative bg-[#05060A] overflow-hidden lg:flex flex-col">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-500/90 backdrop-blur-xl text-black px-6 py-2 rounded-full border border-white/20 flex items-center gap-3 text-xs font-bold z-30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-y-2 border-white/30 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="relative">
                        <span className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
                        <MonitorPlay className="w-4 h-4" />
                    </div>
                    PREVIEW EM TEMPO REAL
                </div>

                <div className="w-full h-full p-4 lg:p-12 pb-0 relative flex items-center justify-center">
                    <div className="w-full max-w-6xl h-full shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-none md:rounded-3xl overflow-hidden border border-white/5 transition-all bg-[#09090B] relative group">
                        <div className="h-12 bg-[#121214] border-b border-white/5 flex items-center px-6 gap-3 select-none">
                            <div className="flex gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/40 border border-rose-500/20" />
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/40 border border-amber-500/20" />
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
                            </div>
                            <div className="ml-6 flex-1 max-w-md h-8 bg-black/60 rounded-lg flex items-center px-4 text-[11px] text-white/30 font-mono tracking-tighter border border-white/5 group-hover:border-amber-500/20 transition-colors">
                                <Lock className="w-3 h-3 mr-2 text-white/10" /> {selectedOrg?.slug ? `saasbot.gg/s/${selectedOrg.slug}` : 'saasbot.gg/s/preview'}
                            </div>
                        </div>

                        <iframe
                            ref={iframeRef}
                            src={`/s/preview?orgId=${encodeURIComponent(orgId || '')}&orgName=${encodeURIComponent(selectedOrg?.name || '')}&orgSlug=${encodeURIComponent(selectedOrg?.slug || '')}`}
                            onLoad={() => setIframeReady(true)}
                            className="w-full h-[calc(100%-3rem)] bg-transparent border-0"
                        />
                    </div>
                </div>
            </main>

            <Dialog open={!!upsellTemplate} onOpenChange={() => setUpsellTemplate(null)}>
                <DialogContent className="sm:max-w-[425px] border-amber-500/20 bg-[#0C0C0E]">
                    <DialogHeader>
                        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6 shadow-2xl border border-amber-500/10">
                            <Crown className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter">DESIGN PRO ELITE</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground/80 leading-relaxed uppercase">
                            O template <strong>{upsellDetails?.name}</strong> e ferramentas de personalização avançadas exigem o <strong>PLANO PRO</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-sm text-foreground space-y-4">
                            <p className="font-bold uppercase tracking-widest text-amber-500">Benefícios Exclusivos:</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-xs font-bold"><Sparkles className="w-4 h-4 text-emerald-400" /> ACESSO AOS 6 TEMPLATES PREMIUM</li>
                                <li className="flex items-center gap-3 text-xs font-bold"><Sparkles className="w-4 h-4 text-emerald-400" /> CUSTOM CSS E WALLPAPERS 4K</li>
                                <li className="flex items-center gap-3 text-xs font-bold"><Sparkles className="w-4 h-4 text-emerald-400" /> REMOÇÃO DA MARCA ORBITOS</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-3">
                        <Button variant="ghost" className="uppercase text-[10px] font-bold tracking-widest" onClick={() => setUpsellTemplate(null)}>
                            Fechar
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black uppercase text-[11px] h-12 rounded-xl group">
                            Unlock Everything Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
