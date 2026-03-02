import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const servers = await prisma.server.findMany();
    console.log('Servers in DB:');
    servers.forEach(s => {
        console.log(`- ${s.name} (${s.discordGuildId}): isActive=${s.isActive}, lastSeenAt=${s.lastSeenAt}, organizationId=${s.organizationId}`);
    });
    process.exit(0);
}

check();
