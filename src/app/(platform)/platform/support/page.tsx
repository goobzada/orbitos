'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function PlatformSupportAccessPage() {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleUsePin = async () => {
        if (!pin || pin.length !== 6) {
            toast.error("O PIN deve ter exatamente 6 dígitos.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/support/use-pin', { pin });

            toast.success(data.message || "Acesso de suporte iniciado com sucesso!");

            // Logar no painel temporário
            // Salvamos o token principal atual para poder retornar depois
            const currentToken = localStorage.getItem('token');
            if (currentToken) localStorage.setItem('orbitos_original_token', currentToken);

            // Salvamos o novo token de Impersonation
            localStorage.setItem('token', data.token);
            // Sincroniza com cookie para SSR
            document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

            // Trocar o activeOrgId para a orgId fornecida pelo session.organization
            if (data.organization?.id) {
                localStorage.setItem('orbitos_active_org', data.organization.id);
            }

            // Invalida o state atual
            queryClient.clear();

            // Redireciona para o dashboard client
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "PIN inválido ou expirado. Verifique com o cliente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Painel de Acesso Seguro (Suporte)</h1>
                <p className="text-muted-foreground mt-2">
                    Nenhum colaborador tem acesso direto às contas dos clientes. Para dar suporte em uma conta, solicite um PIN gerado em tempo real pelo dono da organização.
                </p>
            </div>

            <Card className="border-red-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                <CardHeader className="text-center pt-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl">Autorização via PIN</CardTitle>
                    <CardDescription>
                        Insira o código de 6 dígitos informado pelo proprietário da loja.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        <Input
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').substring(0, 6))}
                            placeholder="000000"
                            className="text-center text-4xl tracking-[1rem] font-mono h-20 w-[340px] bg-background shadow-inner"
                        />
                    </div>

                    <div className="bg-orange-500/10 text-orange-500/80 p-4 rounded-md text-sm flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <strong>Aviso de Auditoria:</strong> Ao entrar usando um PIN de suporte, todas as suas ações, incluindo cliques e alterações de campos (IP e Agent), serão 100% monitoradas e gravadas no histórico de segurança da organização.
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-8 border-t bg-card pt-6">
                    <Button
                        size="lg"
                        variant="default"
                        className="w-full max-w-sm font-semibold"
                        onClick={handleUsePin}
                        disabled={loading || pin.length !== 6}
                    >
                        {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                        Validar PIN & Acessar Conta
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
