import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    const ps = await p.templatePreset.findMany();
    console.log(ps.map(p => p.key));
    await p.$disconnect();
}
run();
