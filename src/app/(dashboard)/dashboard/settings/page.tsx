'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Bell, Shield, Palette, Globe, Key, Sparkles, Zap, Loader2, ArrowRight, Languages } from "lucide-react";
import { UpgradePlanModal } from "@/components/modals/upgrade-plan-modal";
import { toast } from "sonner";
import { useOrganizations, useUpdateOrganization } from "@/lib/hooks";
import { useActiveOrg } from "@/lib/use-org-store";
import { useEffect } from "react";
import { SupportAccessCard } from "@/components/settings/support-access-card";

import { useTranslation } from "@/components/providers/language-provider";

export default function SettingsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { activeOrgId } = useActiveOrg();
    const { data: orgs } = useOrganizations();
    const activeOrg = orgs?.find(o => o.id === activeOrgId);
    const updateOrg = useUpdateOrganization(activeOrgId || '');

    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [savingGeneral, setSavingGeneral] = useState(false);
    const [savingSecurity, setSavingSecurity] = useState(false);
    const [maintenance, setMaintenance] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [discordNotif, setDiscordNotif] = useState(true);
    const [twoFactor, setTwoFactor] = useState(true);
    const [revealKey, setRevealKey] = useState(false);

    const [orgName, setOrgName] = useState("");
    const [orgSlug, setOrgSlug] = useState("");
    const [orgSubdomain, setOrgSubdomain] = useState("");
    const [orgCustomDomain, setOrgCustomDomain] = useState("");
    const [orgLanguage, setOrgLanguage] = useState("pt-BR");

    useEffect(() => {
        if (activeOrg) {
            setOrgName(activeOrg.name || "");
            setOrgSlug(activeOrg.slug || "");
            setOrgSubdomain(activeOrg.subdomain || "");
            setOrgCustomDomain(activeOrg.customDomain || "");
            setOrgLanguage(activeOrg.language || "pt-BR");
        }
    }, [activeOrg]);

    const handleSaveGeneral = async () => {
        if (!activeOrgId) return;
        setSavingGeneral(true);
        try {
            await updateOrg.mutateAsync({
                name: orgName,
                slug: orgSlug || undefined,
                subdomain: orgSubdomain || undefined,
                customDomain: orgCustomDomain || undefined,
                language: orgLanguage
            });
            toast.success(t.settings.success || "Configurações atualizadas com sucesso!");
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Erro ao salvar configurações.");
        } finally {
            setSavingGeneral(false);
        }
    };

    const handleSaveSecurity = async () => {
        setSavingSecurity(true);
        await new Promise(r => setTimeout(r, 800)); // TODO: call PATCH /auth/security
        setSavingSecurity(false);
        toast.success("Segurança atualizada!");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UpgradePlanModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.sidebar.settings}</h1>
                <p className="text-muted-foreground">Gerencie as preferências da sua conta e do sistema.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
                    <TabsTrigger value="general" className="gap-2">
                        <Globe className="w-4 h-4" />
                        {t.settings.general}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="w-4 h-4" />
                        Segurança
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="w-4 h-4" />
                        Notificações
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="w-4 h-4" />
                        Aparência
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Plano Atual
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-xl">Plano {activeOrg?.plan || 'Básico'}</p>
                                    <Badge className="bg-primary/20 text-primary border-primary/30">Ativo</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Sua assinatura atual do OrbitOS.</p>
                            </div>
                            <Button className="gap-2" onClick={() => setUpgradeOpen(true)}>
                                <Zap className="w-4 h-4" />
                                Upgrade de Plano
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Sistema</CardTitle>
                            <CardDescription>Configure o nome, a URL base e o idioma da sua plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome da Organização</Label>
                                    <Input id="name" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Minha Comunidade" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="language">{t.settings.language}</Label>
                                    <Select value={orgLanguage} onValueChange={setOrgLanguage}>
                                        <SelectTrigger id="language" className="w-full">
                                            <div className="flex items-center gap-2">
                                                <Languages className="w-4 h-4 text-muted-foreground" />
                                                <SelectValue placeholder="Selecione um idioma" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                            <SelectItem value="en-US">English (United States)</SelectItem>
                                            <SelectItem value="es-ES">Español (España)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground">Isso afetará as mensagens do bot no Discord e as interfaces públicas.</p>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug Exclusivo (URL)</Label>
                                <Input id="slug" value={orgSlug} onChange={e => setOrgSlug(e.target.value)} placeholder="minha-comunidade" />
                                <span className="text-xs text-muted-foreground">O identificador único da sua comunidade dentro da plataforma.</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subdomain">Subdomínio OrbitOS</Label>
                                    <div className="flex items-center shadow-sm rounded-md">
                                        <Input id="subdomain" value={orgSubdomain} onChange={e => setOrgSubdomain(e.target.value)} placeholder="loja" className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                                        <div className="bg-muted px-3 border border-l-0 border-input rounded-r-md h-[40px] flex items-center text-sm text-muted-foreground whitespace-nowrap">.orbitos.com</div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="customDomain">Domínio Próprio</Label>
                                    <Input id="customDomain" value={orgCustomDomain} onChange={e => setOrgCustomDomain(e.target.value)} placeholder="loja.minhacomunidade.com" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between space-x-2 pt-4">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-medium text-sm">Manutenção Global</span>
                                    <span className="text-xs text-muted-foreground pt-1">Ative para desabilitar o acesso de todos os clientes temporariamente.</span>
                                </div>
                                <Switch
                                    checked={maintenance}
                                    onCheckedChange={(v) => {
                                        setMaintenance(v);
                                        toast.info(v ? "Modo manutenção ativado" : "Modo manutenção desativado");
                                    }}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button onClick={handleSaveGeneral} disabled={savingGeneral}>
                                {savingGeneral && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {savingGeneral ? "Salvando..." : t.settings.save}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>


                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Segurança e Autenticação</CardTitle>
                            <CardDescription>Gerencie chaves de API e métodos de login.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="api_key">Chave de API do Core</Label>
                                <div className="flex gap-2">
                                    <Input id="api_key" type={revealKey ? "text" : "password"} value="sk_test_51MzZk1L8wO8B..." readOnly className="flex-1" />
                                    <Button variant="outline" size="sm" onClick={() => setRevealKey(v => !v)}>{revealKey ? "Ocultar" : "Revelar"}</Button>
                                </div>
                            </div>
                            <div className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col space-y-1">
                                        <span className="font-medium text-sm">Autenticação de Dois Fatores</span>
                                        <span className="text-xs text-muted-foreground">Adicione uma camada extra de segurança.</span>
                                    </div>
                                    <Switch
                                        checked={twoFactor}
                                        onCheckedChange={(v) => {
                                            setTwoFactor(v);
                                            toast.info(v ? "2FA ativado" : "2FA desativado");
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4 flex justify-between">
                            <Button variant="outline" onClick={() => toast.info("Em breve: Reset de chaves de API")}>Resetar Chaves</Button>
                            <Button onClick={handleSaveSecurity} disabled={savingSecurity}>
                                {savingSecurity && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {savingSecurity ? "Salvando..." : "Atualizar Segurança"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="mt-6">
                        <SupportAccessCard activeOrgId={activeOrgId} />
                    </div>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notificações</CardTitle>
                            <CardDescription>Escolha como você quer ser alertado sobre eventos importantes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_notif" className="flex flex-col gap-1">
                                    <span>Notificações por E-mail</span>
                                    <span className="font-normal text-xs text-muted-foreground">Receba resumos semanais de analytics.</span>
                                </Label>
                                <Switch id="email_notif" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="discord_notif" className="flex flex-col gap-1">
                                    <span>Webhooks do Discord</span>
                                    <span className="font-normal text-xs text-muted-foreground">Alertas de tickets críticos diretamente no seu canal.</span>
                                </Label>
                                <Switch id="discord_notif" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-amber-500" />
                                Customização do Portal (White-Label)
                            </CardTitle>
                            <CardDescription>
                                Configure temas, presets de layout, logos e CSS customizado para seu portal público e dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-amber-500/10 mb-4">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Editor de Identidade Visual</p>
                                    <p className="text-xs text-muted-foreground">Acesso a templates premium, aurora backgrounds e tipografia avançada.</p>
                                </div>
                                <Button className="bg-amber-500 hover:bg-amber-600 font-bold" onClick={() => router.push('/dashboard/settings/identity')}>
                                    Abrir Editor <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preferências do Painel</CardTitle>
                            <CardDescription>Configurações rápidas de visualização local.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Cor Primária</Label>
                                <div className="flex gap-2">
                                    {['bg-[#3b82f6]', 'bg-[#10b981]', 'bg-[#f59e0b]', 'bg-[#ef4444]', 'bg-[#8b5cf6]'].map((color) => (
                                        <div key={color} className={`w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-white transition-all ${color}`} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-medium text-sm">Modo de Alto Contraste</span>
                                    <span className="text-xs text-muted-foreground">Melhora a legibilidade em ambientes claros.</span>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
