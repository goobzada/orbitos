import prisma from '../src/lib/prisma';

async function run() {
    const ticketId = (await prisma.module.findUnique({ where: { key: 'ticket' } }))?.id;
    if (ticketId) {
        await prisma.module.update({
            where: { key: 'ticket' },
            data: {
                settingsSchema: {
                    fields: [
                        { name: 'channelId', label: 'ID do Canal de Suporte', type: 'channel' },
                        { name: 'categoryId', label: 'ID da Categoria dos Tickets', type: 'category' },
                        { name: 'staffRoleId', label: 'ID do Cargo Staff', type: 'role' },
                        { name: 'welcomeMessage', label: 'Mensagem de Boas-vindas', type: 'text' }
                    ]
                }
            }
        });
        // Add a preset for 'game' type
        await prisma.modulePreset.upsert({
            where: { moduleId_communityType: { moduleId: ticketId, communityType: 'game' } },
            update: { presetConfig: { welcomeMessage: 'Bem-vindo ao suporte {user}! Como seu personagem {id} pode ser ajudado?' } },
            create: { moduleId: ticketId, communityType: 'game', presetConfig: { welcomeMessage: 'Bem-vindo ao suporte {user}! Como seu personagem {id} pode ser ajudado?' } }
        });
    }

    const whitelistId = (await prisma.module.findUnique({ where: { key: 'whitelist_quiz' } }))?.id;
    if (whitelistId) {
        await prisma.module.update({
            where: { key: 'whitelist_quiz' },
            data: {
                settingsSchema: {
                    fields: [
                        { name: 'channelId', label: 'ID do Canal do Quiz', type: 'channel' },
                        { name: 'roleId', label: 'Cargo a Entregar', type: 'role' },
                        { name: 'passPercentage', label: 'Porcentagem p/ Passar', type: 'number' }
                    ]
                }
            }
        });
    }

    const levelsId = (await prisma.module.findUnique({ where: { key: 'level_system' } }))?.id;
    if (levelsId) {
        await prisma.module.update({
            where: { key: 'level_system' },
            data: {
                settingsSchema: {
                    fields: [
                        { name: 'rankChannelId', label: 'ID do Canal de Rank', type: 'channel' },
                        { name: 'xpMultiplier', label: 'Multiplicador de XP', type: 'number' }
                    ]
                }
            }
        });
    }

    const couponId = (await prisma.module.findUnique({ where: { key: 'coupon' } }))?.id;
    if (couponId) {
        await prisma.module.update({
            where: { key: 'coupon' },
            data: {
                settingsSchema: {
                    fields: [
                        { name: 'discountPercent', label: '% de Desconto', type: 'number' },
                        { name: 'maxUses', label: 'Limite de Usos', type: 'number' }
                    ]
                }
            }
        });
    }

    console.log('Schemas e Presets atualizados com sucesso!');
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
