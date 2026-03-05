'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Bot, BarChart3, Server, Ticket, Users, ArrowRight, Zap, Shield,
  Globe, CheckCircle2, ChevronRight, Layers, Fingerprint, Database,
  Terminal, Lock, Check, Gamepad2, ShoppingCart, Code2, Cpu,
  Sparkles, Blocks, Palette, Workflow, Languages
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/components/providers/language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { t, lang, setLang } = useTranslation();

  const features = [
    { icon: Server, title: t.landing.nav.ecosystem, desc: t.landing.ecosystem.discord_desc },
    { icon: Ticket, title: t.landing.nav.infra, desc: t.landing.infra.desc },
    { icon: Users, title: t.landing.audience.owners_title, desc: t.landing.audience.owners_desc },
    { icon: BarChart3, title: t.analytics.monthly_growth, desc: t.analytics.revenue_desc },
    { icon: Zap, title: t.landing.ecosystem.badge, desc: t.landing.ecosystem.desc },
    { icon: Shield, title: t.landing.infra.badge, desc: t.landing.infra.desc },
  ];

  const infraFeatures = [
    { icon: Database, title: t.landing.infra.multi_tenant_title, text: t.landing.infra.multi_tenant_desc },
    { icon: Lock, title: t.landing.infra.websocket_title, text: t.landing.infra.websocket_desc },
    { icon: Shield, title: t.landing.infra.stripe_title, text: t.landing.infra.stripe_desc },
    { icon: Fingerprint, title: t.landing.infra.audit_title, text: t.landing.infra.audit_desc }
  ];

  const templates = [
    { name: "Neon Grid", type: t.landing.audience.creators_title, color: "from-fuchsia-500 to-cyan-500" },
    { name: "Minimal Glass", type: t.landing.audience.enterprise_title, color: "from-slate-400 to-slate-200" },
    { name: "Terminal", type: t.landing.audience.devs_title, color: "from-emerald-500 to-emerald-700" },
    { name: "Aurora", type: t.landing.audience.creators_title, color: "from-violet-500 via-fuchsia-500 to-orange-500" },
    { name: "Blocks", type: t.landing.audience.owners_title, color: "from-blue-500 to-indigo-500" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col overflow-hidden font-sans selection:bg-violet-500/30">

      {/* Background System Mestre */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden mix-blend-screen opacity-60">
        {/* Radial Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-[#020617] to-[#020617]" />

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        {/* Orbs de Iluminação Profunda */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Header Premium */}
      <header className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50" />
            <Cpu className="h-5 w-5 text-white relative z-10" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Orbit<span className="text-violet-400 font-medium">Up.io</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#ecossistema" className="hover:text-white transition-colors">{t.landing.nav.ecosystem}</Link>
          <Link href="#infra" className="hover:text-white transition-colors">{t.landing.nav.infra}</Link>
          <Link href="#brand-engine" className="hover:text-white transition-colors">{t.landing.nav.brandEngine}</Link>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white transition-colors">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0B1120] border-white/10 text-slate-300">
              <DropdownMenuItem onClick={() => setLang('pt-BR')} className="hover:bg-white/5 cursor-pointer">Português (Brasil)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang('en-US')} className="hover:bg-white/5 cursor-pointer">English (US)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang('es-ES')} className="hover:bg-white/5 cursor-pointer">Español (ES)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/login">
            <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200 px-6 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105">
              {t.landing.nav.dashboard}
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION DE ALTA CONVERSÃO (2 Colunas) */}
      <section className="relative z-20 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 py-20 lg:py-32 max-w-[1600px] mx-auto min-h-[85vh] gap-16">

        {/* Left Column - Copy & CTA */}
        <div className="flex-1 flex flex-col items-start text-left lg:max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-300 mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            {t.landing.hero.badge}
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            {t.landing.hero.title1}
            <br className="hidden lg:block" />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent"> {t.landing.hero.title2}</span>
          </h1>

          <p className="mt-8 text-lg lg:text-xl text-slate-400 max-w-xl font-medium leading-relaxed">
            {t.landing.hero.desc}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/login">
              <Button size="lg" className="h-14 w-full sm:w-auto px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all hover:-translate-y-1 text-base">
                {t.landing.hero.cta1} <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 w-full sm:w-auto px-8 rounded-xl font-semibold border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all text-base">
              {t.landing.hero.cta2}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500/70" /> {t.landing.hero.no_card}</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500/70" /> {t.landing.hero.setup_time}</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500/70" /> {t.landing.hero.cancel_anytime}</div>
          </div>
        </div>

        {/* Right Column - Hero Visual Proof (Dashboard Mockup) */}
        <div className="flex-[1.2] w-full relative group perspective-[2000px]">
          {/* Center Glow Behind Mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-violet-600/20 blur-[100px] rounded-full mix-blend-screen transition-opacity group-hover:bg-violet-600/30" />

          {/* Dashboard Container */}
          <div className="relative rotate-y-[-12deg] rotate-x-[5deg] transition-transform duration-700 ease-out group-hover:rotate-y-[0deg] group-hover:rotate-x-[0deg] rounded-2xl border border-white/10 bg-[#0B1120]/90 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">

            {/* Fake Browser Chrome */}
            <div className="h-10 border-b border-white/5 bg-black/40 flex items-center px-4 gap-2">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-700" /><div className="w-3 h-3 rounded-full bg-slate-700" /><div className="w-3 h-3 rounded-full bg-slate-700" /></div>
              <div className="ml-4 h-5 flex-1 bg-white/5 rounded mx-4 flex items-center justify-center text-[10px] text-slate-500 font-mono">dashboard.saasbot.gg</div>
            </div>

            {/* Fake Dashboard Body */}
            <div className="p-6 flex gap-6 h-[450px]">
              {/* Sidebar mock */}
              <div className="w-48 flex flex-col gap-3">
                <div className="h-8 w-full bg-white/5 rounded-lg mb-4" />
                {[...Array(6)].map((_, i) => <div key={i} className="h-6 w-full bg-white/5 rounded" />)}
              </div>
              {/* Main Mock */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="h-10 w-full bg-white/5 rounded-lg flex items-center px-4 justify-between">
                  <div className="w-32 h-4 bg-white/10 rounded" />
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/50" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20" />
                      <div className="w-16 h-4 bg-white/20 rounded" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 rounded-xl border border-white/5 bg-[#050B14] p-4 flex flex-col gap-3 overflow-hidden">
                  <div className="w-32 h-4 bg-white/10 rounded mb-2" />
                  {[...Array(4)].map((_, i) => <div key={i} className={`h-12 w-full rounded border border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}`} />)}
                </div>
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
        </div>
      </section>

      {/* ECOSSISTEMA ORBIT (Nova Seção) */}
      <section id="ecossistema" className="relative z-20 py-24 px-6 lg:px-12 bg-black/40 border-t border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-violet-400 tracking-wider uppercase mb-3">{t.landing.ecosystem.badge}</h2>
            <h3 className="text-3xl lg:text-5xl font-bold text-white mb-4">{t.landing.ecosystem.title}</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t.landing.ecosystem.desc}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Server, title: t.landing.ecosystem.discord_title, desc: t.landing.ecosystem.discord_desc, active: true },
              { icon: Gamepad2, title: t.landing.ecosystem.games_title, desc: t.landing.ecosystem.games_desc, active: false },
              { icon: ShoppingCart, title: t.landing.ecosystem.commerce_title, desc: t.landing.ecosystem.commerce_desc, active: false },
              { icon: Code2, title: t.landing.ecosystem.api_title, desc: t.landing.ecosystem.api_desc, active: false },
            ].map((block, i) => (
              <div key={i} className="group relative rounded-2xl border border-white/5 bg-[#080C17] p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                {!block.active && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-white/5 text-slate-500 border border-white/10">{t.landing.ecosystem.soon}</div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${block.active ? 'from-violet-500/10' : 'from-slate-500/5'} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`h-16 w-16 rounded-2xl ${block.active ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400' : 'bg-white/5 border border-white/10 text-slate-400'} flex items-center justify-center mb-6 shadow-lg`}>
                    <block.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{block.title}</h4>
                  <p className="text-sm text-slate-400 font-medium">{block.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO TÉCNICA (Infraestrutura) */}
      <section id="infra" className="relative z-20 py-24 px-6 lg:px-12 max-w-[1400px] mx-auto min-h-[60vh] flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-500/20">
              <Terminal className="w-3.5 h-3.5" /> {t.landing.infra.badge}
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">{t.landing.infra.title1} <span className="text-blue-400">{t.landing.infra.title2}</span></h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              {t.landing.infra.desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {infraFeatures.map((feat, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <feat.icon className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm mb-1">{feat.title}</h5>
                    <p className="text-slate-500 text-sm">{feat.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Abstract Infra Mockup */}
          <div className="relative h-[400px] rounded-2xl border border-white/10 bg-[#060913] p-8 overflow-hidden flex items-center justify-center">
            {/* Grid Pattern */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Center Core */}
            <div className="relative z-10 w-32 h-32 rounded-full border-2 border-blue-500/30 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.4)] transition-all">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-30" />
              <div className="w-24 h-24 rounded-full bg-blue-500/20 backdrop-blur border border-blue-400/50 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <Database className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
              </div>

              {/* Orbits */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="absolute inset-0 rounded-full border border-blue-500/10 animate-[spin_10s_linear_infinite]" style={{ margin: `-${(i + 1) * 40}px`, animationDuration: `${(i + 1) * 10}s`, animationDirection: i % 2 === 0 ? 'normal' : 'reverse' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 border border-white/20 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  {i === 1 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-violet-500 border border-white/20 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BRAND ENGINE / TEMPLATES */}
      <section id="brand-engine" className="relative z-20 py-24 px-6 lg:px-12 bg-[#020617] border-t border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-fuchsia-500/5 to-transparent blur-3xl opacity-50" />

        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-6 border border-fuchsia-500/20">
            <Palette className="w-3.5 h-3.5" /> {t.landing.brand.badge}
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">{t.landing.brand.title1} <span className="text-fuchsia-400">{t.landing.brand.title2}</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-16">
            {t.landing.brand.desc}
          </p>

          {/* Cards dos Templates Modernos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6 w-full">
            {templates.map((t, i) => (
              <div key={i} className="group relative w-full rounded-2xl border border-white/10 bg-[#090E1A] p-5 lg:p-6 text-left hover:-translate-y-2 transition-transform cursor-crosshair overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${t.color}`} />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors" />

                <h4 className="text-xl font-bold text-white mb-1">{t.name}</h4>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{t.type}</p>

                <div className="mt-8 flex gap-2 transition-all">
                  <div className="w-8 h-8 rounded border border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all drop-shadow-md" />
                  <div className="flex-1 rounded border border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all drop-shadow-md" />
                </div>
                <div className="mt-2 h-16 w-full rounded border border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO AUDIÊNCIA (4 Colunas) */}
      <section className="relative z-20 py-24 px-6 lg:px-12 max-w-[1400px] mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-16">{t.landing.audience.title}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { title: t.landing.audience.creators_title, desc: t.landing.audience.creators_desc },
            { title: t.landing.audience.owners_title, desc: t.landing.audience.owners_desc },
            { title: t.landing.audience.enterprise_title, desc: t.landing.audience.enterprise_desc },
            { title: t.landing.audience.devs_title, desc: t.landing.audience.devs_desc },
          ].map((aud, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 border-t border-white/5 pt-8 hover:-translate-y-1 transition-transform">
              <h4 className="text-lg font-bold text-white mb-3">{aud.title}</h4>
              <p className="text-sm text-slate-400">{aud.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO COMPARAÇÃO */}
      <section className="relative z-20 py-24 px-6 lg:px-12 bg-black/40 border-t border-b border-white/5">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">{t.landing.comparison.title}</h2>
          <p className="text-slate-400 text-lg mb-16 max-w-2xl mx-auto">
            {t.landing.comparison.desc}
          </p>

          <div className="grid md:grid-cols-2 bg-[#060913] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Coluna Ruim */}
            <div className="p-8 lg:p-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col gap-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl opacity-50" />
              <h3 className="text-xl font-bold text-slate-400 flex items-center justify-center gap-2 mb-4">
                {t.landing.comparison.bad_title}
              </h3>
              {[
                { label: t.landing.comparison.row1, val: false },
                { label: t.landing.comparison.row2, val: false },
                { label: t.landing.comparison.row3, val: false },
                { label: t.landing.comparison.row4, val: false },
                { label: t.landing.comparison.row5, val: false },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-medium text-slate-500 border-b border-white/5 pb-4 last:border-0">
                  <span className="text-left">{item.label}</span>
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <span className="text-red-400 font-bold text-xs">x</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coluna Boa */}
            <div className="p-8 lg:p-12 bg-gradient-to-br from-violet-500/5 to-transparent flex flex-col gap-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-3xl opacity-50" />
              <div className="absolute -top-[1px] -left-px -right-px h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-4">
                {t.landing.comparison.good_title}
              </h3>
              {[
                { label: t.landing.comparison.row1_good, val: true },
                { label: t.landing.comparison.row2_good, val: true },
                { label: t.landing.comparison.row3_good, val: true },
                { label: t.landing.comparison.row4_good, val: true },
                { label: t.landing.comparison.row5_good, val: true },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-bold text-slate-300 border-b border-white/5 pb-4 last:border-0">
                  <span className="text-left">{item.label}</span>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="relative z-20 py-32 px-6 lg:px-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/40 via-transparent to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto p-1px bg-gradient-to-b from-white/10 to-transparent rounded-3xl">
          <div className="bg-[#050812]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-12 lg:p-16 flex flex-col items-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">{t.landing.cta_final.title}</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl">
              {t.landing.cta_final.desc}
            </p>
            <Link href="/login">
              <Button size="lg" className="h-16 px-10 bg-white text-slate-900 hover:bg-slate-200 hover:scale-105 font-bold rounded-2xl text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
                {t.landing.cta_final.button}
              </Button>
            </Link>
            <p className="mt-6 text-sm text-slate-500 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Cancelamento a qualquer momento
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER ENTERPRISE */}
      <footer className="relative z-20 border-t border-white/5 bg-black py-12 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <Cpu className="h-5 w-5" />
            <span className="font-bold tracking-tight">OrbitUp.io</span>
          </div>
          <p className="text-sm text-slate-600">
            © 2026 OrbitUp.io. {t.landing.footer.copyright}
          </p>
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <Link href="#" className="hover:text-white transition-colors">{t.landing.footer.terms}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t.landing.footer.privacy}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
