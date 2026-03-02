const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'discorduser@example.com';
    const user = await prisma.user.update({
        where: { email },
        data: { role: 'SUPER_ADMIN' }
    });
    console.log(`✅ Usuário ${user.username} (${user.email}) promovido a SUPER_ADMIN!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
