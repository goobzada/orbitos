'use client';

import { useState } from 'react';
import { ExternalLink, BookOpen, Code2, Shield, Zap, Globe, Key, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslation } from "@/components/providers/language-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface QuickRef {
    method: string;
    path: string;
    description: string;
    category: string;
}

const quickRefs: QuickRef[] = [
    { method: 'GET', path: '/auth/me', description: 'Dados do usuário logado', category: 'Auth' },
    { method: 'GET', path: '/organizations/me', description: 'Minhas organizações', category: 'Org' },
    { method: 'GET', path: '/servers', description: 'Servidores vinculados', category: 'Servidores' },
    { method: 'GET', path: '/tickets', description: 'Listar tickets', category: 'Tickets' },
    { method: 'GET', path: '/automations/triggers', description: 'Gatilhos disponíveis', category: 'Automações' },
    { method: 'GET', path: '/automations/actions', description: 'Ações disponíveis', category: 'Automações' },
    { method: 'POST', path: '/automations/:orgId', description: 'Criar automação', category: 'Automações' },
    { method: 'GET', path: '/billing/:orgId/status', description: 'Status de faturamento', category: 'Billing' },
    { method: 'POST', path: '/billing/:orgId/checkout', description: 'Iniciar upgrade', category: 'Billing' },
    { method: 'GET', path: '/store/:orgId/products', description: 'Produtos da loja', category: 'Loja' },
    { method: 'GET', path: '/stats/:orgId', description: 'Estatísticas', category: 'Analytics' },
];

const methodColors: Record<string, string> = {
    GET: 'bg-blue-600/80 text-blue-100',
    POST: 'bg-emerald-600/80 text-emerald-100',
    PUT: 'bg-amber-600/80 text-amber-100',
    PATCH: 'bg-cyan-600/80 text-cyan-100',
    DELETE: 'bg-rose-600/80 text-rose-100',
};

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copiado!');
    };

    return (
        <button onClick={handleCopy} className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

export default function ApiDocsPage() {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('Todos');

    const categories = ['Todos', ...Array.from(new Set(quickRefs.map(r => r.category)))];
    const filtered = quickRefs.filter(r => activeCategory === 'Todos' || r.category === activeCategory);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        {t.docs.title}
                    </h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                        {t.docs.subtitle}
                    </p>
                </div>
                <div className="flex gap-3">
                    <a href={`${API_BASE}/docs/client`} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 h-10">
                            <BookOpen className="h-4 w-4" />
                            Swagger UI
                            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                        </Button>
                    </a>
                    <a href={`${API_BASE}/docs/client/spec.json`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2 h-10">
                            <Code2 className="h-4 w-4" />
                            OpenAPI JSON
                        </Button>
                    </a>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border/50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-violet-400" />
                        </div>
                        <h3 className="font-bold">{t.docs.base_url}</h3>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                        <code className="text-xs text-violet-300 flex-1 truncate">{API_BASE}</code>
                        <CopyButton text={API_BASE} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{t.docs.base_url_desc}</p>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <Key className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h3 className="font-bold">{t.docs.auth}</h3>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                        <code className="text-xs text-cyan-300 flex-1 truncate">Authorization: Bearer {'<token>'}</code>
                        <CopyButton text="Authorization: Bearer <token>" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{t.docs.auth_desc}</p>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h3 className="font-bold">{t.docs.rate_limits}</h3>
                    </div>
                    <div className="space-y-1.5 mt-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{t.docs.rate_limit_global}</span>
                            <span className="text-emerald-400 font-mono">100 req/15min</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Rotas internas</span>
                            <span className="text-amber-400 font-mono">20 req/min</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Planos */}
            <div className="bg-gradient-to-r from-violet-950/40 to-slate-950/30 border border-violet-500/20 rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-400" />
                    {t.docs.plan_limits}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/50">
                                {['Recurso', 'FREE', 'PRO', 'ENTERPRISE', 'MAX'].map(h => (
                                    <th key={h} className="text-left pb-3 pr-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {[
                                ['Servidores Discord', '1', '5', '20', '∞'],
                                ['Tickets/mês', '50', '500', '∞', '∞'],
                                ['Produtos na Loja', '5', '50', '∞', '∞'],
                                ['Automações', '3', '20', '∞', '∞'],
                                ['Sorteios Ativos', '2', '10', '∞', '∞'],
                            ].map(([label, ...values]) => (
                                <tr key={label}>
                                    <td className="py-2.5 pr-6 text-muted-foreground text-xs">{label}</td>
                                    {values.map((v, i) => (
                                        <td key={i} className={`py-2.5 pr-6 font-mono font-bold text-xs ${v === '∞' ? 'text-emerald-400' :
                                            i === 0 ? 'text-slate-400' :
                                                i === 1 ? 'text-violet-400' :
                                                    i === 2 ? 'text-amber-400' : 'text-rose-400'
                                            }`}>{v}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Reference */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="font-bold text-lg">{t.docs.quick_ref}</h2>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${activeCategory === cat
                                    ? 'bg-violet-500/10 border-violet-500/50 text-violet-400'
                                    : 'bg-card border-border/50 text-muted-foreground hover:border-border'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/50 bg-secondary/20">
                                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground w-16">Método</th>
                                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Endpoint</th>
                                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Descrição</th>
                                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Categoria</th>
                                <th className="w-8 px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filtered.map((ref, i) => (
                                <tr key={i} className="group hover:bg-secondary/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase font-mono ${methodColors[ref.method] || 'bg-muted'}`}>
                                            {ref.method}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <code className="text-xs text-violet-300 font-mono">{ref.path}</code>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{ref.description}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wide">
                                            {ref.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <CopyButton text={`${API_BASE}${ref.path}`} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Exemplo de uso */}
            <div className="space-y-4">
                <h2 className="font-bold text-lg">{t.docs.usage_example}</h2>
                <div className="bg-[#0f0f13] border border-border/50 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/10">
                        <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">exemplo.sh</span>
                        <CopyButton text={`curl -X GET "${API_BASE}/automations/triggers" \\\n  -H "Authorization: Bearer SEU_TOKEN"\n`} />
                    </div>
                    <pre className="text-xs text-slate-300 p-5 overflow-x-auto leading-relaxed font-mono">
                        {`# 1. Buscar triggers disponíveis
curl -X GET "${API_BASE}/automations/triggers" \\
  -H "Authorization: Bearer SEU_TOKEN"

# 2. Criar uma automação
curl -X POST "${API_BASE}/automations/ORG_ID" \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Boas-vindas",
    "serverId": "SERVER_ID",
    "trigger": "member.joined",
    "actions": [{
      "driver": "discord",
      "type": "send_message",
      "params": {
        "channelId": "CHANNEL_ID",
        "content": "Bem-vindo, {username}! 🎉"
      }
    }]
  }'`}
                    </pre>
                </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                    href={`${API_BASE}/docs/client`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-card border border-violet-500/20 rounded-2xl hover:border-violet-500/50 transition-all group"
                >
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-6 w-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold group-hover:text-violet-300 transition-colors">{t.docs.interactive_swagger}</p>
                        <p className="text-xs text-muted-foreground">{t.docs.interactive_swagger_desc}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </a>

                <a
                    href={`${API_BASE}/docs/client/spec.json`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-card border border-cyan-500/20 rounded-2xl hover:border-cyan-500/50 transition-all group"
                >
                    <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <Code2 className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold group-hover:text-cyan-300 transition-colors">{t.docs.openapi_spec}</p>
                        <p className="text-xs text-muted-foreground">{t.docs.openapi_spec_desc}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </a>
            </div>
        </div>
    );
}
