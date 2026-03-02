'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";

export default function PlatformSettings() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações da Plataforma</h1>
                <p className="text-muted-foreground">Ajustes globais do Community OS.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-amber-400" /> Geral</CardTitle>
                        <CardDescription>Nome da plataforma e configurações básicas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da Plataforma</Label>
                            <Input defaultValue="Community OS" className="bg-background" />
                        </div>
                        <div className="space-y-2">
                            <Label>URL Base da API</Label>
                            <Input defaultValue="http://localhost:4000" className="bg-background" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Versão</Label>
                            <Input defaultValue="1.0.0-beta" className="bg-background" disabled />
                        </div>
                        <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
                            <Save className="w-4 h-4" /> Salvar
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-amber-500/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-amber-400" /> Segurança</CardTitle>
                        <CardDescription>Tokens e chaves de acesso interno.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>JWT Secret</Label>
                            <Input defaultValue="••••••••••••••••" type="password" className="bg-background" />
                        </div>
                        <div className="space-y-2">
                            <Label>Internal Service Key</Label>
                            <Input defaultValue="••••••••••••••••" type="password" className="bg-background" />
                        </div>
                        <div className="space-y-2">
                            <Label>Stripe Webhook Secret</Label>
                            <Input defaultValue="" placeholder="whsec_..." className="bg-background" />
                        </div>
                        <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
                            <Save className="w-4 h-4" /> Salvar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
