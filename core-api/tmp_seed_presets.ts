import prisma from './src/lib/prisma';

const FIVE_M_PRESET = {
    passPercentage: 80,
    questions: [
        {
            id: 'q1',
            question: 'O que significa RDM (Random Deathmatch)?',
            options: ['Matar um jogador sem motivo RP ou ação prévia.', 'Fugir da polícia correndo muito.', 'Bater o carro sem querer.'],
            answer: 'Matar um jogador sem motivo RP ou ação prévia.'
        },
        {
            id: 'q2',
            question: 'O que significa VDM (Vehicle Deathmatch)?',
            options: ['Usar o veículo como arma para matar ou atropelar sem motivo.', 'Conduzir em alta velocidade na contramão.', 'Disputar racha na cidade.'],
            answer: 'Usar o veículo como arma para matar ou atropelar sem motivo.'
        },
        {
            id: 'q3',
            question: 'O que é MetaGaming?',
            options: ['Usar informações de fora do jogo (OOC) para benefício dentro do jogo (IC).', 'Jogar muito tempo seguido.', 'Falar com amigos no Discord enquanto joga.'],
            answer: 'Usar informações de fora do jogo (OOC) para benefício dentro do jogo (IC).'
        },
        {
            id: 'q4',
            question: 'O que é PowerGaming?',
            options: ['Realizar ações impossíveis na vida real ou forçar RP sobre outros.', 'Ter as melhores armas do servidor.', 'Correr muito rápido com o carro.'],
            answer: 'Realizar ações impossíveis na vida real ou forçar RP sobre outros.'
        },
        {
            id: 'q5',
            question: 'O que é Combat Logging?',
            options: ['Deslogar do jogo durante uma ação de RP em andamento.', 'Entrar no combate de surpresa.', 'Gravar a ação para denunciar depois.'],
            answer: 'Deslogar do jogo durante uma ação de RP em andamento.'
        },
        {
            id: 'q6',
            question: 'O que é Fear RP?',
            options: ['Valorizar a vida do personagem, agindo com medo quando está sob ameaça real.', 'Gritar de medo durante as ações.', 'Correr de medo da polícia.'],
            answer: 'Valorizar a vida do personagem, agindo com medo quando está sob ameaça real.'
        },
        {
            id: 'q7',
            question: 'O que significa IC (In Character)?',
            options: ['Tudo o que acontece dentro do contexto e vida do seu personagem.', 'Informações Compartilhadas.', 'Comando de Iniciar Combate.'],
            answer: 'Tudo o que acontece dentro do contexto e vida do seu personagem.'
        },
        {
            id: 'q8',
            question: 'O que significa OOC (Out Of Character)?',
            options: ['Fora do contexto do personagem (Ações do jogador real).', 'Organização Ofensiva de Combate.', 'Outra Opção de Carro.'],
            answer: 'Fora do contexto do personagem (Ações do jogador real).'
        },
        {
            id: 'q9',
            question: 'Qual a regra principal de uma Safe Zone?',
            options: ['É proibido iniciar qualquer tipo de crime ou ação agressiva na área.', 'Pode correr, mas não pode atirar.', 'Lugar seguro para guardar dinheiro.'],
            answer: 'É proibido iniciar qualquer tipo de crime ou ação agressiva na área.'
        },
        {
            id: 'q10',
            question: 'O que é Revenge Kill?',
            options: ['Retornar para matar quem te matou logo após sofrer um PK (Player Kill).', 'Matar por vingança em uma ação de RP.', 'Matar o assassino do seu amigo.'],
            answer: 'Retornar para matar quem te matou logo após sofrer um PK (Player Kill).'
        }
    ]
};

async function run() {
    const moduleId = 'fe376f63-bbcd-4b72-836c-f6e9214ae6c9'; // Whitelist Quiz ID

    // Criar preset para 'game'
    await prisma.modulePreset.upsert({
        where: { moduleId_communityType: { moduleId, communityType: 'game' } },
        update: { presetConfig: FIVE_M_PRESET as any },
        create: { moduleId, communityType: 'game', presetConfig: FIVE_M_PRESET as any }
    });

    // Criar preset para 'general' (fallback do usuário)
    await prisma.modulePreset.upsert({
        where: { moduleId_communityType: { moduleId, communityType: 'general' } },
        update: { presetConfig: FIVE_M_PRESET as any },
        create: { moduleId, communityType: 'general', presetConfig: FIVE_M_PRESET as any }
    });

    console.log('✅ Presets FiveM aplicados ao banco de dados para whitelist_quiz!');
}

run().catch(console.error);
