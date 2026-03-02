"use client";

import { useState, useEffect } from "react";
import { useOrganizations, useStoreSettings, useUpdateStoreSettings } from "@/lib/hooks";
import { Save, Settings2, CreditCard, Banknote, ShieldCheck, Zap, Cog, Sparkles, AlertCircle, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { useActiveOrg } from "@/lib/use-org-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StoreSettingsPage() {
    const { activeOrgId } = useActiveOrg();
    const { data: orgs } = useOrganizations();
    const org = orgs?.find(o => o.id === activeOrgId);
    const isFree = org?.plan === 'FREE';

    const { data: settings, isLoading } = useStoreSettings(activeOrgId || "");
    const updateSettings = useUpdateStoreSettings(activeOrgId || "");

    const [formData, setFormData] = useState({
        enabled: false,
        currency: "BRL",
        checkoutProvider: "STRIPE",
        config: {
            stripePublishableKey: "",
            stripeSecretKey: "",
            pixToken: ""
        }
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                enabled: settings.enabled || false,
                currency: settings.currency || "BRL",
                checkoutProvider: settings.checkoutProvider || "STRIPE",
                config: typeof settings.config === 'string' ? JSON.parse(settings.config) : (settings.config || {})
            });
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            await updateSettings.mutateAsync(formData);
            toast.success('Configurações da loja salvas com sucesso!');
        } catch (err) {
            toast.error('Erro ao salvar configurações.');
        }
    };

    const renderLocked = () => (
        <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-[2.5rem] border border-border/50">
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/30 shadow-2xl shadow-amber-500/10">
                <ShieldCheck className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-black mb-3">Recurso Exclusivo</h2>
            <p className="max-w-md text-muted-foreground mb-8 text-lg leading-relaxed">
                A ativação da Store Engine de alta performance está disponível apenas para membros <span className="text-violet-500 font-bold uppercase tracking-widest text-sm">Pro</span> ou <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">Max</span>.
            </p>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-violet-500/20 transition-all hover:scale-105 active:scale-95">
                DAR UM UPGRADE AGORA
            </Button>
        </div>
    );

    if (isLoading) return <div className="max-w-4xl mx-auto p-12 text-center text-muted-foreground">Carregando configurações...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 fade-in pb-20 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-violet-500 font-semibold text-xs uppercase tracking-widest mb-2">
                        <Cog className="w-4 h-4" />
                        Preferências do Sistema
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Configurações da Loja</h1>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                        Gerencie gateways de pagamento, visibilidade pública e comportamento do checkout.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={updateSettings.isPending}
                    className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-bold h-12 px-8 rounded-xl shadow-lg shadow-violet-500/25"
                >
                    {updateSettings.isPending ? <Zap className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
                    {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
            </div>

            {isFree && renderLocked()}

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isFree ? 'opacity-20 pointer-events-none blur-sm grayscale' : ''}`}>
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <div className="p-8 rounded-[2rem] border border-border bg-card/40 backdrop-blur-sm shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">Estado da Store Engine</h3>
                                <p className="text-sm text-muted-foreground">Controle se a sua loja está pública para os jogadores.</p>
                            </div>
                            <Switch
                                checked={formData.enabled}
                                onCheckedChange={(val) => setFormData({ ...formData, enabled: val })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Moeda Transacional</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                                >
                                    <SelectTrigger className="bg-background/50 border-border h-11 rounded-xl">
                                        <SelectValue placeholder="BRL" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                                        <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Provedor de Checkout</Label>
                                <Select
                                    value={formData.checkoutProvider}
                                    onValueChange={(val) => setFormData({ ...formData, checkoutProvider: val })}
                                >
                                    <SelectTrigger className="bg-background/50 border-border h-11 rounded-xl">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STRIPE">Stripe (Global)</SelectItem>
                                        <SelectItem value="PIX">Pix Automatizado (BR)</SelectItem>
                                        <SelectItem value="HYBRID">Híbrido (Stripe + PIX)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Gateway - Stripe */}
                    <div className="p-8 rounded-[2rem] border border-border bg-card/40 backdrop-blur-sm shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center border border-[#635BFF]/20 shadow-inner">
                                <CreditCard className="w-7 h-7 text-[#635BFF]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold leading-tight">Stripe (Cartão de Crédito)</h3>
                                <p className="text-sm text-muted-foreground">Checkout internacional seguro e recorrências nativas.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Publishable Key</Label>
                                <div className="relative">
                                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500/30" />
                                    <Input
                                        placeholder="pk_test_..."
                                        className="bg-background/50 border-border h-11 rounded-xl pr-10"
                                        value={formData.config.stripePublishableKey}
                                        onChange={(e) => setFormData({ ...formData, config: { ...formData.config, stripePublishableKey: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Secret Key</Label>
                                <Input
                                    placeholder="sk_test_..."
                                    type="password"
                                    className="bg-background/50 border-border h-11 rounded-xl"
                                    value={formData.config.stripeSecretKey}
                                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, stripeSecretKey: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gateway - Pix */}
                    <div className="p-8 rounded-[2rem] border border-border bg-card/40 backdrop-blur-sm shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-inner">
                                <Banknote className="w-7 h-7 text-teal-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold leading-tight">Pix (Mercado Pago / Asaas)</h3>
                                <p className="text-sm text-muted-foreground">Pagamento instantâneo via QR Code para o público brasileiro.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Access Token (API Key)</Label>
                            <Input
                                placeholder="APP_USR-..."
                                type="password"
                                className="bg-background/50 border-border h-11 rounded-xl"
                                value={formData.config.pixToken}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, pixToken: e.target.value } })}
                            />
                            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                A API key deve ter permissões de criação de checkout.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-3xl border border-violet-500/10 bg-violet-500/5 space-y-4">
                        <h4 className="font-bold text-violet-500 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Dica de Performance
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Ative o <strong>Stripe</strong> para garantir assinaturas recorrentes sem falhas e o <strong>Pix</strong> para liquidação imediata de kits únicos.
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl border border-border bg-card/20 space-y-4">
                        <h4 className="font-bold flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Webhook Externo
                        </h4>
                        <div className="p-3 rounded-lg bg-black/20 font-mono text-[10px] break-all border border-border/50 text-violet-300">
                            {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/webhook/stripe
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Copie este URL para o Dashboard do Stripe.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

