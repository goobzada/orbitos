import prisma from '../src/lib/prisma';
async function main() {
    const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });
    const servers = await prisma.server.findMany({ select: { id: true, name: true, isActive: true, organizationId: true } });
    console.log('Orgs:', JSON.stringify(orgs, null, 2));
    console.log('Servers:', JSON.stringify(servers, null, 2));
}
main().finally(() => prisma.$disconnect());
