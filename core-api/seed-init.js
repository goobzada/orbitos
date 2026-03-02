const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- 🛡️ INITIALIZING ORBITOS CORE ---');

    // 1. Create System Admin
    let admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                username: 'OrbitAdmin',
                role: 'SUPER_ADMIN',
                email: 'admin@orbitos.dev'
            }
        });
        console.log('✅ Super Admin criado: OrbitAdmin');
    } else {
        console.log('ℹ️ Super Admin já existe.');
    }

    // 2. Create Default Organization
    let org = await prisma.organization.findFirst();
    if (!org) {
        org = await prisma.organization.create({
            data: {
                name: 'OrbitOS Enterprise',
                ownerId: admin.id,
                plan: 'ENTERPRISE'
            }
        });
        console.log('✅ Organização criada: OrbitOS Enterprise');
    } else {
        console.log('ℹ️ Organização já existe.');
    }

    // 3. Clear previous logs to have a clean feed
    await prisma.auditLog.deleteMany({});

    // 4. Seed Audit Logs
    const activities = [
        {
            action: 'SERVER_CREATED',
            resourceType: 'Server',
            resourceId: 'sh-orbit-alpha',
            organizationId: org.id,
            userId: admin.id,
            metadata: JSON.stringify({ name: 'Orbit Node 01' })
        },
        {
            action: 'STAFF_ADDED',
            resourceType: 'StaffMember',
            resourceId: 'u-admin-fixer',
            organizationId: org.id,
            userId: admin.id,
            metadata: JSON.stringify({ role: 'SR_MODERATOR' })
        },
        {
            action: 'IDENTITY_UPDATED',
            resourceType: 'ThemeStore',
            resourceId: org.id,
            organizationId: org.id,
            userId: admin.id,
            metadata: JSON.stringify({ primary: '#6366f1' })
        },
        {
            action: 'KEY_ROTATED',
            resourceType: 'SecureVault',
            resourceId: 'vault-01',
            organizationId: org.id,
            userId: 'SYSTEM',
            metadata: JSON.stringify({ type: 'AES-256' })
        },
        {
            action: 'POLICY_MODIFIED',
            resourceType: 'AccessControl',
            resourceId: 'acl-global',
            organizationId: org.id,
            userId: admin.id,
            metadata: JSON.stringify({ new_rules: 12 })
        },
        {
            action: 'AUTOMATION_TRIGGERED',
            resourceType: 'FlowEngine',
            resourceId: 'flow-welcome-bot',
            organizationId: org.id,
            userId: 'SYSTEM'
        },
        {
            action: 'BACKUP_COMPLETED',
            resourceType: 'Database',
            resourceId: 'db-main',
            organizationId: org.id,
            userId: 'SYSTEM',
            metadata: JSON.stringify({ size: '1.2GB' })
        }
    ];

    console.log(`Injetando ${activities.length} eventos no banco de dados...`);

    for (const act of activities) {
        await prisma.auditLog.create({ data: act });
    }

    console.log('✅ SETUP COMPLETO. OrbitOS está pronto para teste.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
