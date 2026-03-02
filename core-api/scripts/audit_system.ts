import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
    console.log('--- AUDIT: MODULES & PRESETS ---');
    const modules = await prisma.module.findMany({
        include: { presets: true }
    });

    console.table(modules.map(m => ({
        id: m.id,
        key: m.key,
        name: m.name,
        category: m.category,
        isActive: m.isActive,
        presetsCount: m.presets.length,
        presetsTypes: m.presets.map(p => p.communityType).join(', ')
    })));

    console.log('\n--- AUDIT: ORGANIZATIONS ---');
    const orgs = await prisma.organization.findMany({
        include: { _count: { select: { servers: true, members: true } } }
    });
    console.table(orgs.map(o => ({
        id: o.id,
        name: o.name,
        plan: o.plan,
        community: o.communityType,
        servers: o._count.servers
    })));

    await prisma.$disconnect();
}

audit();
