const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- 🚀 SEEDING AUDIT LOGS (ENTERPRISE FEED) ---');
  
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('❌ ERRO: Nenhuma organização encontrada. Crie uma primeiro.');
    return;
  }

  const user = await prisma.user.findFirst();

  const activities = [
    {
      action: 'SERVER_CREATED',
      resourceType: 'Server',
      resourceId: 'sh-orbit-alpha',
      organizationId: org.id,
      userId: user?.id,
      metadata: JSON.stringify({ name: 'Orbit Node 01' })
    },
    {
      action: 'STAFF_ADDED',
      resourceType: 'StaffMember',
      resourceId: 'u-admin-fixer',
      organizationId: org.id,
      userId: user?.id,
      metadata: JSON.stringify({ role: 'SR_MODERATOR' })
    },
    {
      action: 'IDENTITY_UPDATED',
      resourceType: 'ThemeStore',
      resourceId: org.id,
      organizationId: org.id,
      userId: user?.id,
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
      userId: user?.id,
      metadata: JSON.stringify({ new_rules: 12 })
    },
    {
      action: 'USER_ROLE_UPDATED',
      resourceType: 'Profile',
      resourceId: user?.id,
      organizationId: org.id,
      userId: user?.id,
      metadata: JSON.stringify({ old: 'USER', new: 'SUPER_ADMIN' })
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

  console.log('✅ SEED COMPLETO. O Activity Feed agora deve exibir dados reais.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
