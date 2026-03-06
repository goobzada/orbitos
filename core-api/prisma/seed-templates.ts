import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
    console.log('🌱 Seeding Template Presets...');

    await prisma.templatePreset.upsert({
        where: { key: 'default-classic' },
        update: {},
        create: {
            key: 'default-classic',
            name: 'Classic Dark',
            description: 'Painel clássico com sidebar. Neutro e limpo para qualquer comunidade.',
            minPlan: 'FREE',
            config: {
                layoutType: 'dashboard-sidebar',
                navigation: 'sidebar',
                heroMode: 'small',
                cardShape: 'rounded',
                backgroundPattern: 'none',
                fontPreset: 'default'
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'neon-grid' },
        update: {},
        create: {
            key: 'neon-grid',
            name: 'Neon Grid',
            description: 'Para servidores gamer e comunidades hardcore. Grid neon e glow em cards.',
            minPlan: 'PRO',
            config: {
                layoutType: 'dashboard-sidebar',
                navigation: 'sidebar',
                heroMode: 'small',
                cardShape: 'glow',
                backgroundPattern: 'grid-neon',
                fontPreset: 'default'
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'minimal-glass' },
        update: {},
        create: {
            key: 'minimal-glass',
            name: 'Minimal Glass',
            description: 'Top-nav limpo com glassmorphism. Ideal para comunidades sérias e B2B.',
            minPlan: 'PRO',
            config: {
                layoutType: 'dashboard-topnav',
                navigation: 'topnav',
                heroMode: 'small',
                cardShape: 'glass',
                backgroundPattern: 'none',
                fontPreset: 'minimal'
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'terminal-dark' },
        update: {},
        create: {
            key: 'terminal-dark',
            name: 'Terminal Dark',
            description: 'Estética CLI para desenvolvedores e equipes de infra/DevOps.',
            minPlan: 'PRO',
            config: {
                layoutType: 'terminal',
                navigation: 'sidebar',
                heroMode: 'none',
                cardShape: 'square',
                backgroundPattern: 'scanline',
                fontPreset: 'mono'
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'aurora-landing' },
        update: {},
        create: {
            key: 'aurora-landing',
            name: 'Aurora Landing',
            description: 'Landing page com aurora animada. Perfeito para venda de planos VIP.',
            minPlan: 'PRO',
            config: {
                layoutType: 'marketing-landing',
                navigation: 'topnav',
                heroMode: 'full',
                cardShape: 'elevated',
                backgroundPattern: 'aurora',
                fontPreset: 'default'
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'modular-blocks' },
        update: {},
        create: {
            key: 'modular-blocks',
            name: 'Modular Blocks',
            description: 'Dashboard em grid de blocos. Ideal para comunidades com muitos módulos.',
            minPlan: 'PRO',
            config: {
                layoutType: 'blocks',
                navigation: 'sidebar',
                heroMode: 'small',
                cardShape: 'block',
                backgroundPattern: 'none',
                fontPreset: 'default'
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'cosmic-ultra' },
        update: {},
        create: {
            key: 'cosmic-ultra',
            name: 'Cosmic Ultra',
            description: 'Experiência exclusiva para membros MAX. Cores profundas e partículas espaciais.',
            minPlan: 'MAX',
            config: {
                layoutType: 'dashboard-sidebar',
                navigation: 'sidebar',
                heroMode: 'small',
                cardShape: 'glass-intense',
                backgroundPattern: 'cosmos',
                fontPreset: 'modern'
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'obsidian-empire' },
        update: {},
        create: {
            key: 'obsidian-empire',
            name: 'Obsidian Empire',
            description: 'Dark luxury puro. Dourado, edges afiadas e power-vibes para comunidades dominantes.',
            minPlan: 'MAX',
            config: {
                layoutType: 'dashboard-sidebar',
                navigation: 'sidebar',
                heroMode: 'full',
                cardShape: 'sharp-gold',
                backgroundPattern: 'obsidian-grid',
                fontPreset: 'luxury',
                accentColor: '#C9A84C',
                primaryColor: '#C9A84C',
                backgroundColor: '#050505',
                surfaceColor: '#0F0F0F',
                navBackground: '#080808',
                borderColor: '#C9A84C33',
                textColor: '#F5F0E8',
                fontFamily: 'Playfair Display',
                borderRadiusPx: 4,
                letterSpacingPx: 1
            }
        }
    });

    await prisma.templatePreset.upsert({
        where: { key: 'hologram-pro' },
        update: {},
        create: {
            key: 'hologram-pro',
            name: 'Hologram PRO',
            description: 'UI holográfica futurista. Cyan neon, camadas translúcidas e efeitos HUD exclusivos.',
            minPlan: 'MAX',
            config: {
                layoutType: 'dashboard-topnav',
                navigation: 'topnav',
                heroMode: 'full',
                cardShape: 'holo-glass',
                backgroundPattern: 'hologram-mesh',
                fontPreset: 'tech',
                accentColor: '#00F5FF',
                primaryColor: '#00F5FF',
                backgroundColor: '#01040D',
                surfaceColor: '#030C1A',
                navBackground: '#020816',
                borderColor: '#00F5FF22',
                textColor: '#D0F4FF',
                fontFamily: 'JetBrains Mono',
                borderRadiusPx: 2,
                letterSpacingPx: 1
            }
        }
    });

    console.log('✅ Template Presets criados!');
}

seedTemplates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
