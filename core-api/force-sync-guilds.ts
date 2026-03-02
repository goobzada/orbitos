import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const orgs = await prisma.organization.findMany();
    if (orgs.length === 0) return;

    const botGuildIds = ['1184920261314351134', '1341490234159530084'];
    const targetOrg = orgs[0];

    console.log(`Associando guilds do bot à organização: ${targetOrg.name} (${targetOrg.id})`);

    for (const guildId of botGuildIds) {
        await prisma.server.upsert({
            where: { discordGuildId: guildId },
            update: {
                isActive: true,
                lastSeenAt: new Date(),
                organizationId: targetOrg.id
            },
            create: {
                discordGuildId: guildId,
                name: `Discord Server ${guildId.slice(-4)}`,
                isActive: true,
                lastSeenAt: new Date(),
                organizationId: targetOrg.id
            }
        });
    }

    console.log('✅ Guilds sincronizadas com a organização principal.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
