import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const servers = await prisma.server.findMany();
    console.log('Servers in DB:');
    servers.forEach(s => {
        const lastSeen = s.lastSeenAt ? new Date(s.lastSeenAt).getTime() : 0;
        const now = new Date().getTime();
        const diffSec = Math.floor((now - lastSeen) / 1000);
        console.log(`- ${s.name} (${s.discordGuildId}): isActive=${s.isActive}, lastSeenAt=${s.lastSeenAt}, diff=${diffSec}s, organizationId=${s.organizationId}`);
    });
    process.exit(0);
}

check();
