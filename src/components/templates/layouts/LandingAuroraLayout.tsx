import React from 'react';
import { TemplateConfig, CommunityData } from '../types';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

export function LandingAuroraLayout({ config, community }: Props) {
    const [activeSection, setActiveSection] = React.useState('Home');
    // Configs para Aurora Gradient
    const [gradientPos, setGradientPos] = React.useState(0);

    // Efeito simples de movimento de gradient
    React.useEffect(() => {
        const int = setInterval(() => setGradientPos((p) => (p + 1) % 100), 50);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-fuchsia-500">

            {/* Animated Aurora Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40 blur-3xl z-0 transition-all duration-1000 ease-linear"
                style={{
                    background: `
            radial-gradient(circle at ${50 + Math.sin(gradientPos / 10) * 20}% ${40 + Math.cos(gradientPos / 15) * 20}%, 
            rgba(236,72,153,0.4) 0%, transparent 40%),
            radial-gradient(circle at ${30 - Math.cos(gradientPos / 10) * 30}% ${70 + Math.sin(gradientPos / 15) * 20}%, 
            rgba(168,85,247,0.4) 0%, transparent 50%),
            radial-gradient(circle at ${80 + Math.sin(gradientPos / 20) * 10}% ${20 - Math.cos(gradientPos / 20) * 10}%, 
            rgba(59,130,246,0.4) 0%, transparent 40%)
          `
                }}
            />

            <div className="relative z-10">
                {/* Navigation */}
                <nav className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
                    <div
                        onClick={() => setActiveSection('Home')}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        {config.logoUrl ? (
                            <img
                                src={config.logoUrl}
                                alt={community.name}
                                style={{ height: (config.logoHeight || 32) + 'px' }}
                                className="object-contain"
                            />
                        ) : (
                            <>
                                <div className="bg-white/10 p-2 rounded-xl border border-white/20 backdrop-blur-md">
                                    <img src={community.avatar} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                                </div>
                                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                    {community.name}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-white/60">
                        {['Recursos', 'Planos VIP', 'Depoimentos', 'FAQ'].map(item => (
                            <button
                                key={item}
                                onClick={() => setActiveSection(item)}
                                className={`transition-colors hover:text-white ${activeSection === item ? 'text-white' : ''}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div>
                        <button className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-white/20">
                            Dashboard
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="mt-32 w-full max-w-4xl mx-auto text-center px-4 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-fuchsia-300 font-medium mb-8 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                        </span>
                        Vagas abertas para {community.name}
                    </div>

                    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Eleve sua experiência ao<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 animate-gradient-x">
                            Próximo Nível
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/60 font-light max-w-2xl leading-relaxed mb-12">
                        {community.description} Desbloqueie acessos exclusivos, chats restritos e assets VIP assinando hoje.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <button className="px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all hover:-translate-y-1">
                            Ver Planos VIP
                        </button>
                        <button className="px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 rounded-full font-bold text-lg backdrop-blur-md transition-all">
                            Entrar no Discord Livre
                        </button>
                    </div>
                </section>

                {/* Value Prop Section */}
                <section className="mt-40 max-w-6xl mx-auto px-6 pb-32">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-purple-500/30 border border-fuchsia-500/20 mb-6" />
                                <h3 className="text-xl font-bold mb-3">Benefício VIP #{i}</h3>
                                <p className="text-white/60 font-light leading-relaxed">
                                    Acesso imediato a canais de alto valor e atendimento prioritário pelos nossos moderadores.
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
