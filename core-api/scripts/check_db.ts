
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const servers = await prisma.server.findMany({
        include: { organization: true }
    });
    console.log('SERVERS_COUNT:', servers.length);
    console.log('SERVERS:', JSON.stringify(servers, null, 2));

    const users = await prisma.user.findMany();
    console.log('USERS:', JSON.stringify(users, null, 2));

    const orgs = await prisma.organization.findMany();
    console.log('ORGS_COUNT:', orgs.length);
    console.log('ORGS:', JSON.stringify(orgs, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
