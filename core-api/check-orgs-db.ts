import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const orgs = await prisma.organization.findMany();
    console.log('Organizations in DB:');
    orgs.forEach(o => {
        console.log(`- ${o.name} (${o.id})`);
    });
    process.exit(0);
}

check();
