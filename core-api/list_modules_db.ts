import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    const modules = await p.module.findMany({ select: { id: true, key: true, name: true } });
    console.log(JSON.stringify(modules, null, 2));
    await p.$disconnect();
}
run();
