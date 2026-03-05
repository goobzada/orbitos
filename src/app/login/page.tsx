'use client';

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/components/providers/language-provider";

function LoginPageContent() {
    const { t, lang } = useTranslation();
    const searchParams = useSearchParams();
    const authError = searchParams.get('error');
    const authDetail = searchParams.get('detail');
    const [loading, setLoading] = useState<string | null>(null);

    // Mock OAuth Request para permitir QA (Bypass no Front/Auth.js)
    const handleOAuthLogin = async (provider: string) => {
        setLoading(provider);
        try {
            // Em um ambiente real, aqui chamaria await signIn(provider) do NextAuth.
            const payload = {
                provider,
                providerUserId: `${provider}-user-${Math.floor(Math.random() * 999999)}`,
                email: `${provider}user@example.com`,
                username: `Tester ${provider.toUpperCase()}`,
                avatar: `https://avatar.vercel.sh/${provider}`
            };

            const { data } = await api.post('/auth/oauth-login', payload);

            // Server sets HttpOnly cookie automatically via Set-Cookie header
            toast.success(`${t.auth.authenticating}`);
            window.location.replace('/dashboard');
        } catch (error: any) {
            toast.error(t.auth.server_offline);
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden">
            {/* Gradient background left panel */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 bg-gradient-to-br from-violet-900/40 via-blue-900/30 to-indigo-900/40">
                {/* Orbs */}
                <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col items-center text-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                        <Bot className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">OrbitUp</span>
                            <span className="text-white/80 font-light">.io</span>
                        </h1>
                        <p className="mt-2 text-lg text-white/60">{t.auth.professional_dashboard}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4 w-full max-w-sm">
                        {[
                            t.landing.hero.title1 + " " + t.landing.hero.title2,
                            t.dashboard.sidebar.tickets + " & " + t.dashboard.sidebar.staff,
                            t.analytics.monthly_growth,
                            t.landing.infra.badge,
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - Login form */}
            <div className="flex flex-1 items-center justify-center p-8 relative">
                {/* Mobile orbs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl lg:hidden" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl lg:hidden" />

                <div className="relative z-10 w-full max-w-md flex flex-col gap-8">
                    {/* Logo mobile */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Bot className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">OrbitUp.io</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{t.auth.title}</h2>
                        <p className="mt-2 text-muted-foreground">
                            {t.auth.subtitle}
                        </p>
                    </div>

                    {/* Banner de erro vindo do callback */}
                    {authError && (
                        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold">{t.auth.error_title}</p>
                                <p className="text-xs mt-0.5 text-red-400/80">
                                    {authDetail || (authError === 'discord_denied' ? t.auth.error_denied :
                                        authError === 'no_token' ? t.auth.error_no_token :
                                            t.auth.error_generic)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <Button
                            id="btn-discord-login"
                            size="lg"
                            className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white text-base font-semibold flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#5865F2]/30"
                            onClick={() => {
                                const discordUrl = process.env.NEXT_PUBLIC_DISCORD_LOGIN_URL;
                                if (!discordUrl) {
                                    toast.error('URL do Discord não configurada.', {
                                        description: 'Defina NEXT_PUBLIC_DISCORD_LOGIN_URL no .env.local',
                                    });
                                    return;
                                }
                                setLoading('discord');
                                // Reseta o estado caso a navegação falhe (ex: popup bloqueado)
                                setTimeout(() => setLoading(null), 8000);
                                window.location.href = discordUrl;
                            }}
                            disabled={loading !== null}
                        >
                            {loading === 'discord' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                                    <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
                                </svg>
                            )}
                            <span className="flex-1 text-center pr-8">
                                {loading === 'discord' ? t.auth.authenticating : t.auth.discord_btn}
                            </span>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full h-12 bg-white text-slate-900 border-slate-200 hover:bg-slate-50 text-base font-semibold flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm"
                            onClick={() => handleOAuthLogin('google')}
                            disabled={loading !== null}
                        >
                            {loading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <svg viewBox="0 0 24 24" className="w-5 h-5">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    <path d="M1 1h22v22H1z" fill="none" />
                                </svg>
                            )}
                            <span className="flex-1 text-center pr-8">
                                {loading === 'google' ? t.auth.authenticating : t.auth.google_btn}
                            </span>
                        </Button>

                        <Button
                            size="lg"
                            className="w-full h-12 bg-[#24292e] hover:bg-[#1b1f23] text-white text-base font-semibold flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#24292e]/30"
                            onClick={() => handleOAuthLogin('github')}
                            disabled={loading !== null}
                        >
                            {loading === 'github' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                            )}
                            <span className="flex-1 text-center pr-8">
                                {loading === 'github' ? t.auth.authenticating : t.auth.github_btn}
                            </span>
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">{t.auth.info}</span>
                        </div>
                    </div>

                    <div className="space-y-2 text-center text-xs text-muted-foreground">
                        <p>{t.auth.redirect_msg}</p>
                        <p>
                            {t.auth.terms_msg}{" "}
                            <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
                                {t.auth.terms_link}
                            </Link>{" "}
                            {lang === 'pt-BR' ? 'e' : lang === 'es-ES' ? 'y' : 'and'}{" "}
                            <Link href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
                                {t.auth.privacy_link}
                            </Link>
                            .
                        </p>
                    </div>

                    <div className="text-center">
                        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                            ← {t.auth.back_home}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginPageContent />
        </Suspense>
    );
}
