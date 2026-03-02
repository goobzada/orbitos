import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    const org = await p.organization.findFirst({
        where: { slug: 'reaction' },
        include: { template: true }
    });
    console.log(JSON.stringify(org, null, 2));
    await p.$disconnect();
}
run();
