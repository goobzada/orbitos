/**
 * seed-store-products.ts
 * Cria produtos de teste para a loja do servidor.
 */
import prisma from './src/lib/prisma';

async function run() {
    // Busca a primeira organização no banco
    const org = await prisma.organization.findFirst();
    if (!org) {
        console.error('❌ Nenhuma organização encontrada no banco.');
        process.exit(1);
    }

    console.log(`[SEED] Criando produtos para a organização: ${org.name} (${org.id})`);

    const products = [
        {
            name: 'Plano VIP Bronze',
            slug: 'vip-bronze',
            description: 'Acesso a canais exclusivos e tag especial no chat.',
            priceCents: 1990, // R$ 19,90
            currency: 'BRL',
            status: 'ACTIVE',
            deliveryType: 'AUTO_ROLE',
            isFeatured: true
        },
        {
            name: 'Plano VIP Gold',
            slug: 'vip-gold',
            description: 'Prioridade em filas, tag destacada e suporte prioritário.',
            priceCents: 4990, // R$ 49,90
            currency: 'BRL',
            status: 'ACTIVE',
            deliveryType: 'AUTO_ROLE',
            isFeatured: true
        },
        {
            name: 'Kit de Itens In-Game',
            slug: 'kit-items',
            description: 'Receba uma caixa com itens básicos para sua jornada.',
            priceCents: 990, // R$ 9,90
            currency: 'BRL',
            status: 'ACTIVE',
            deliveryType: 'MANUAL',
            isFeatured: false
        }
    ];

    for (const p of products) {
        await prisma.storeProduct.upsert({
            where: { organizationId_slug: { organizationId: org.id, slug: p.slug } },
            update: p,
            create: { ...p, organizationId: org.id }
        });
    }

    console.log('✅ Produtos de teste criados com sucesso!');
    await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
