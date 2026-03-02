import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const servers = await prisma.server.findMany();
    const orgs = await prisma.organization.findMany();

    console.log('--- DATA DUMP ---');
    console.log(JSON.stringify({ servers, orgs }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
