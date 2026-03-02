'use client';

import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupportSessions, useGenerateSupportPin, useRevokeSupportSession } from "@/lib/hooks";
import { KeyRound, ShieldAlert, X, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SupportAccessCard({ activeOrgId }: { activeOrgId: string | null }) {
    const { data: sessions, isLoading } = useSupportSessions(activeOrgId || "");
    const generatePinMutation = useGenerateSupportPin(activeOrgId || "");
    const revokeMutation = useRevokeSupportSession(activeOrgId || "");

    const [recentPin, setRecentPin] = useState<{ pin: string, expiresAt: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!activeOrgId) return;
        try {
            const res = await generatePinMutation.mutateAsync();
            setRecentPin({ pin: res.pin, expiresAt: res.session.expiresAt });
            toast.success("PIN de suporte gerado com sucesso.");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao gerar PIN");
        }
    };

    const handleRevoke = async (sessionId: string) => {
        if (!activeOrgId) return;
        if (!confirm("Tem certeza que deseja revogar este acesso imediatamente?")) return;

        try {
            await revokeMutation.mutateAsync(sessionId);
            toast.success("Acesso revogado.");
            if (recentPin) setRecentPin(null);
        } catch (error: any) {
            toast.error("Erro ao revogar acesso.");
        }
    };

    const handleCopy = () => {
        if (recentPin) {
            navigator.clipboard.writeText(recentPin.pin);
            setCopied(true);
            toast.success("PIN copiado.");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const activeSessions = sessions?.filter(s => s.status === 'ACTIVE') || [];
    const hasActive = activeSessions.length > 0;

    if (!activeOrgId) return null;

    return (
        <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Acesso Temporário de Suporte (PIN)
                </CardTitle>
                <CardDescription>
                    Gere um PIN seguro de 6 dígitos para permitir que a equipe do OrbitOS acesse sua organização temporariamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentPin && (
                    <div className="bg-background border rounded-lg p-4 flex flex-col items-center justify-center space-y-2">
                        <span className="text-sm text-muted-foreground">Informe este PIN ao agente de suporte:</span>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-mono tracking-widest font-bold">{recentPin.pin}</span>
                            <Button variant="outline" size="icon" onClick={handleCopy}>
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <span className="text-xs text-orange-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expira em 15 minutos. Uso único.
                        </span>
                    </div>
                )}

                {hasActive && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Sessões Ativas</h4>
                        {activeSessions.map((session: any) => (
                            <div key={session.id} className="flex justify-between items-center bg-background border rounded-md p-3 text-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium flex items-center gap-2">
                                        <KeyRound className="w-3 h-3 text-primary" /> PIN Ativo
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Expira em: {format(new Date(session.expiresAt), "HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                                <Button size="sm" variant="destructive" onClick={() => handleRevoke(session.id)} disabled={revokeMutation.isPending}>
                                    <X className="w-4 h-4 mr-1" /> Encerrar
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {!hasActive && !recentPin && (
                    <p className="text-sm text-muted-foreground">Nenhuma sessão de suporte ativa.</p>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between bg-red-500/5">
                <span className="text-xs text-muted-foreground max-w-[60%]">
                    O acesso via PIN restringe o agente a visualizar configurações. Ações destrutivas continuam bloqueadas.
                </span>
                <Button variant="default" onClick={handleGenerate} disabled={generatePinMutation.isPending || hasActive}>
                    {generatePinMutation.isPending ? "Gerando..." : "Gerar PIN de Suporte"}
                </Button>
            </CardFooter>
        </Card>
    );
}
