/**
 * seed-whitelist-preset.ts
 * Seed definitivo do preset do whitelist_quiz (12 perguntas padrão FiveM/RP)
 * Formato correto: { text, options: string[], correctAnswer: number (índice) }
 *
 * Rodar na VPS:
 *   cd ~/orbitos/core-api
 *   npx ts-node seed-whitelist-preset.ts
 */
import prisma from './src/lib/prisma';

const DEFAULT_QUESTIONS = [
    {
        text: 'O que significa RDM (Random Deathmatch)?',
        options: ['Matar um jogador sem motivo RP ou ação prévia.', 'Fugir da polícia correndo muito.', 'Bater o carro sem querer.'],
        correctAnswer: 0
    },
    {
        text: 'O que significa VDM (Vehicle Deathmatch)?',
        options: ['Usar o veículo como arma para matar ou atropelar sem motivo.', 'Conduzir em alta velocidade na contramão.', 'Disputar racha na cidade.'],
        correctAnswer: 0
    },
    {
        text: 'O que é MetaGaming?',
        options: ['Usar informações de fora do jogo (OOC) para benefício dentro do jogo (IC).', 'Jogar muito tempo seguido.', 'Falar com amigos no Discord enquanto joga.'],
        correctAnswer: 0
    },
    {
        text: 'O que é PowerGaming?',
        options: ['Realizar ações impossíveis na vida real ou forçar RP sobre outros.', 'Ter as melhores armas do servidor.', 'Correr muito rápido com o carro.'],
        correctAnswer: 0
    },
    {
        text: 'O que é Combat Logging?',
        options: ['Deslogar do jogo durante uma ação de RP em andamento.', 'Entrar no combate de surpresa.', 'Gravar a ação para denunciar depois.'],
        correctAnswer: 0
    },
    {
        text: 'O que é Fear RP?',
        options: ['Valorizar a vida do personagem, agindo com medo quando está sob ameaça real.', 'Gritar de medo durante as ações.', 'Correr de medo da polícia.'],
        correctAnswer: 0
    },
    {
        text: 'O que significa IC (In Character)?',
        options: ['Tudo o que acontece dentro do contexto e vida do seu personagem.', 'Informações Compartilhadas.', 'Comando de Iniciar Combate.'],
        correctAnswer: 0
    },
    {
        text: 'O que significa OOC (Out Of Character)?',
        options: ['Fora do contexto do personagem (Ações do jogador real).', 'Organização Ofensiva de Combate.', 'Outra Opção de Carro.'],
        correctAnswer: 0
    },
    {
        text: 'Qual a regra principal de uma Safe Zone?',
        options: ['É proibido iniciar qualquer tipo de crime ou ação agressiva na área.', 'Pode correr, mas não pode atirar.', 'Lugar seguro para guardar dinheiro.'],
        correctAnswer: 0
    },
    {
        text: 'O que é Revenge Kill?',
        options: ['Retornar para matar quem te matou logo após sofrer um PK.', 'Matar por vingança em uma ação de RP.', 'Matar o assassino do seu amigo.'],
        correctAnswer: 0
    },
    {
        text: 'O que significa NLR (New Life Rule)?',
        options: ['Após morrer, seu personagem perde toda memória do que aconteceu antes da morte.', 'Nova regra de login do servidor.', 'Proibição de retornar ao local onde morreu.'],
        correctAnswer: 0
    },
    {
        text: 'O que é Erotic Roleplay (ERP)?',
        options: ['Conteúdo sexual dentro do jogo — proibido na maioria dos servidores.', 'Estilo avançado de roleplay emocional.', 'Roleplay de personagem exagerado.'],
        correctAnswer: 0
    },
];

const PRESET_CONFIG = {
    passPercentage: 75,
    autoApprove: true,
    roleId: '',   // Admin preenche no dashboard
    questions: DEFAULT_QUESTIONS,
};

async function run() {
    // Busca o ID do módulo whitelist_quiz no banco
    const module = await prisma.module.findUnique({ where: { key: 'whitelist_quiz' } });

    if (!module) {
        console.error('❌ Módulo whitelist_quiz não encontrado no banco. Execute o seed de módulos primeiro.');
        process.exit(1);
    }

    console.log(`[SEED] Módulo whitelist_quiz encontrado: ${module.id}`);

    for (const communityType of ['game', 'general', 'fivem', 'roleplay']) {
        await prisma.modulePreset.upsert({
            where: { moduleId_communityType: { moduleId: module.id, communityType } },
            update: { presetConfig: PRESET_CONFIG as any },
            create: { moduleId: module.id, communityType, presetConfig: PRESET_CONFIG as any },
        });
        console.log(`[SEED] ✅ Preset criado/atualizado para communityType="${communityType}"`);
    }

    console.log(`\n✅ Preset do whitelist_quiz com ${DEFAULT_QUESTIONS.length} perguntas aplicado ao banco!`);
    console.log('💡 Quando o tenant ativar o módulo, as perguntas pré-configuradas serão carregadas automaticamente.');
    await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
