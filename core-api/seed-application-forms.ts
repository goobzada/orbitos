import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de Formulários de Recrutamento...');

    // Busca o primeiro servidor cadastrado (ou você pode trocar pelo seu ID específico)
    const server = await prisma.server.findFirst({
        include: { organization: true }
    });

    if (!server) {
        console.error('❌ Nenhum servidor encontrado para vincular o formulário. Rode o bot/sync primeiro.');
        return;
    }

    console.log(`📡 Vinculando formulário ao servidor: ${server.name} (${server.discordGuildId})`);

    // 1. Cria o Formulário de Staff
    const staffForm = await prisma.applicationForm.upsert({
        where: { id: 'staff-recruitment-default' },
        update: {
            status: 'ACTIVE',
        },
        create: {
            id: 'staff-recruitment-default',
            organizationId: server.organizationId,
            serverId: server.id,
            name: 'Recrutamento de Staff 🚀',
            description: 'Participe da nossa equipe e ajude a comunidade a crescer!',
            successMessage: 'Sua inscrição para Staff foi recebida! Nossa equipe entrará em contato em breve.',
            status: 'ACTIVE',
        }
    });

    // 2. Adiciona as Perguntas
    const questions = [
        {
            label: 'Qual seu nome completo e idade?',
            placeholder: 'Ex: João Silva, 22 anos',
            type: 'TEXT',
            order: 1,
            required: true
        },
        {
            label: 'Por que você deseja fazer parte da nossa equipe?',
            placeholder: 'Conte-nos suas motivações...',
            type: 'PARAGRAPH',
            order: 2,
            required: true
        },
        {
            label: 'Você já teve experiência prévia em outros servidores?',
            placeholder: 'Se sim, quais e em quais cargos?',
            type: 'PARAGRAPH',
            order: 3,
            required: false
        },
        {
            label: 'Quanto tempo você pode dedicar ao servidor por dia?',
            placeholder: 'Ex: 4 horas na parte da noite',
            type: 'TEXT',
            order: 4,
            required: true
        },
        {
            label: 'O que você faria se visse um jogador quebrando as regras?',
            placeholder: 'Descreva sua conduta em uma situação de conflito.',
            type: 'PARAGRAPH',
            order: 5,
            required: true
        }
    ];

    for (const q of questions) {
        await prisma.applicationQuestion.create({
            data: {
                formId: staffForm.id,
                ...q
            }
        });
    }

    console.log('✅ Seed de Formulários concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
