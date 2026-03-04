import {
    Client,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
} from 'discord.js';
import { BaseModule } from '../BaseModule';
import { moduleLoader } from '../../index';
import { log } from '../../utils/logger';

interface QuizSession {
    guildId: string;
    questions: any[];
    currentIndex: number;
    score: number;
    passPercentage: number;
    roleId: string;
    autoApprove: boolean;
}

const sessions = new Map<string, QuizSession>();

const DEFAULT_QUESTIONS = [
    { text: 'O que significa RDM (Random Deathmatch)?', options: ['Matar um jogador sem motivo RP ou ação prévia.', 'Fugir da polícia correndo muito.', 'Bater o carro sem querer.'], correctAnswer: 0 },
    { text: 'O que significa VDM (Vehicle Deathmatch)?', options: ['Usar o veículo como arma para matar ou atropelar sem motivo.', 'Conduzir em alta velocidade.', 'Disputar racha na cidade.'], correctAnswer: 0 },
    { text: 'O que é MetaGaming?', options: ['Usar informações de fora do jogo para benefício dentro dele.', 'Jogar muito tempo seguido.', 'Falar com amigos no Discord enquanto joga.'], correctAnswer: 0 },
    { text: 'O que é PowerGaming?', options: ['Realizar ações impossíveis na vida real ou forçar RP sobre outros.', 'Ter as melhores armas do servidor.', 'Correr muito rápido com o carro.'], correctAnswer: 0 },
    { text: 'O que é Combat Logging?', options: ['Deslogar durante uma ação de RP em andamento.', 'Entrar no combate de surpresa.', 'Gravar a ação para denunciar depois.'], correctAnswer: 0 },
    { text: 'O que é Fear RP?', options: ['Valorizar a vida do personagem, agindo com medo quando ameaçado.', 'Gritar de medo durante as ações.', 'Correr de medo da polícia.'], correctAnswer: 0 },
    { text: 'O que significa IC (In Character)?', options: ['Tudo o que acontece dentro do contexto e vida do personagem.', 'Informações Compartilhadas.', 'Comando de Iniciar Combate.'], correctAnswer: 0 },
    { text: 'O que significa OOC (Out Of Character)?', options: ['Fora do contexto do personagem (ações do jogador real).', 'Organização Ofensiva de Combate.', 'Outra Opção de Carro.'], correctAnswer: 0 },
    { text: 'Qual a regra principal de uma Safe Zone?', options: ['É proibido iniciar crime ou ação agressiva na área.', 'Pode correr, mas não pode atirar.', 'Lugar seguro para guardar dinheiro.'], correctAnswer: 0 },
    { text: 'O que é Revenge Kill?', options: ['Retornar para matar quem te matou logo após sofrer um PK.', 'Matar por vingança em uma ação de RP.', 'Matar o assassino do seu amigo.'], correctAnswer: 0 },
    { text: 'O que significa NLR (New Life Rule)?', options: ['Após morrer, seu personagem perde a memória do que aconteceu.', 'Nova regra de login do servidor.', 'Proibição de retornar ao local onde morreu.'], correctAnswer: 0 },
    { text: 'O que é Erotic Roleplay (ERP)?', options: ['Conteúdo sexual dentro do jogo — proibido na maioria dos servidores.', 'Estilo avançado de roleplay emocional.', 'Roleplay de personagem exagerado.'], correctAnswer: 0 },
];

// Normaliza formato antigo (answer: string) para novo (correctAnswer: índice numérico)
function normalizeQuestions(raw: any[]): typeof DEFAULT_QUESTIONS {
    return raw.map(q => {
        if (typeof q.correctAnswer === 'number') return q; // já no formato novo
        // Formato antigo: question/answer strings
        const text = q.text || q.question || 'Pergunta';
        const options: string[] = q.options || [];
        const answerStr: string = q.answer || '';
        const correctAnswer = options.findIndex(o => o === answerStr);
        return { text, options, correctAnswer: correctAnswer >= 0 ? correctAnswer : 0 };
    });
}

// Helper functions to avoid 'this' issues with the interface
async function startQuiz(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;

    const config = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');

    // Usa as perguntas do config OU o fallback padrão de 12 perguntas
    const rawQuestions = config?.questions;
    const questions = (rawQuestions && rawQuestions.length > 0)
        ? normalizeQuestions(rawQuestions)
        : DEFAULT_QUESTIONS;

    sessions.set(interaction.user.id, {
        guildId: interaction.guildId,
        questions,
        currentIndex: 0,
        score: 0,
        passPercentage: config?.passPercentage || 75,
        roleId: config?.roleId || '',
        autoApprove: config?.autoApprove !== false
    });

    await sendQuestion(interaction, interaction.user.id);
}

// Gera uma barra de progresso visual com blocos Unicode
function progressBar(current: number, total: number, size = 12): string {
    const filled = Math.round((current / total) * size);
    const empty = size - filled;
    return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
}

// Cor dinâmica por fase do quiz
function quizColor(current: number, total: number): number {
    const pct = current / total;
    if (pct < 0.33) return 0x5865F2; // Azul Discord — início
    if (pct < 0.66) return 0xFEE75C; // Amarelo — meio caminho
    return 0x57F287;                  // Verde — quase lá!
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

async function sendQuestion(interaction: ButtonInteraction, userId: string) {
    const session = sessions.get(userId);
    if (!session) return;

    const question = session.questions[session.currentIndex];
    const current = session.currentIndex + 1;
    const total = session.questions.length;
    const bar = progressBar(session.currentIndex, total);
    const pct = Math.round((session.currentIndex / total) * 100);

    const embed = new EmbedBuilder()
        .setTitle(`📋  Quiz de Whitelist  —  Pergunta ${current} de ${total}`)
        .setDescription(
            `### ${question.text}\n\n` +
            `\`${bar}\`  **${pct}% concluído**`
        )
        .addFields(
            { name: '✅ Acertos até agora', value: `**${session.score}** de **${session.currentIndex}**`, inline: true },
            { name: '📊 Restantes', value: `**${total - session.currentIndex}** perguntas`, inline: true },
            { name: '🎯 Nota mínima', value: `**${session.passPercentage}%**`, inline: true },
        )
        .setColor(quizColor(session.currentIndex, total))
        .setFooter({ text: 'OrbitOS Whitelist Engine  •  Escolha a alternativa correta' });

    const row = new ActionRowBuilder<ButtonBuilder>();

    question.options.forEach((opt: string, idx: number) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`quiz_ans_${idx}`)
                .setLabel(`${OPTION_LABELS[idx] ?? String(idx + 1)}. ${opt.substring(0, 70)}`)
                .setStyle(idx === 0 ? ButtonStyle.Primary : idx === 1 ? ButtonStyle.Secondary : ButtonStyle.Secondary)
        );
    });

    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
}

async function handleAnswer(interaction: ButtonInteraction) {
    const userId = interaction.user.id;
    const session = sessions.get(userId);

    // Sem sessão ativa (ex: bot restartou) — responde graciosamente
    if (!session) {
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '⏳ Sua sessão expirou. Use o botão **Iniciar Teste** para recomeçar.', ephemeral: true });
        }
        return;
    }

    // Defer IMEDIATAMENTE (evita o timeout de 3s do Discord)
    await interaction.deferUpdate();

    const answerIndex = parseInt(interaction.customId.replace('quiz_ans_', ''));
    const currentQuestion = session.questions[session.currentIndex];

    if (answerIndex === currentQuestion.correctAnswer) {
        session.score++;
    }

    session.currentIndex++;

    if (session.currentIndex >= session.questions.length) {
        await finishQuiz(interaction, userId);
    } else {
        await sendQuestion(interaction, userId);
    }
}

async function finishQuiz(interaction: ButtonInteraction, userId: string) {
    const session = sessions.get(userId);
    if (!session) return;

    const percent = Math.round((session.score / session.questions.length) * 100);
    const passed = percent >= session.passPercentage;
    const bar = progressBar(session.score, session.questions.length, 14);

    const resultTitle = passed
        ? '🏆  Aprovado na Whitelist!'
        : '❌  Reprovado — Tente Novamente';

    const embed = new EmbedBuilder()
        .setTitle(resultTitle)
        .setDescription(
            passed
                ? `✅ **Parabéns!** Você demonstrou conhecimento suficiente das regras.\nBem-vindo(a) ao servidor!`
                : `❌ **Que pena!** Você não atingiu a pontuação mínima.\nRevisite as regras e tente novamente.`
        )
        .addFields(
            { name: '📊 Resultado', value: `\`${bar}\``, inline: false },
            { name: '✅ Acertos', value: `**${session.score}** de **${session.questions.length}**`, inline: true },
            { name: '📈 Pontuação', value: `**${percent}%**`, inline: true },
            { name: '🎯 Mínimo exigido', value: `**${session.passPercentage}%**`, inline: true },
        )
        .setColor(passed ? 0x57F287 : 0xED4245)
        .setFooter({ text: 'OrbitOS Whitelist Engine' })
        .setTimestamp();

    if (passed && session.roleId && session.autoApprove) {
        try {
            const member = await interaction.guild?.members.fetch(userId);
            if (member) {
                await member.roles.add(session.roleId);
                embed.addFields({ name: 'Cargo Atribuído', value: `<@&${session.roleId}>`, inline: true });
            }
        } catch (err) {
            log.error(`[WhitelistQuiz] Erro ao adicionar cargo: ${err}`);
            embed.setFooter({ text: '⚠️ Erro ao aplicar cargo. Contate um admin.' });
        }
    }

    sessions.delete(userId);
    await interaction.editReply({ embeds: [embed], components: [] });
}

const WhitelistQuizModule: BaseModule = {
    id: 'whitelist_quiz',
    name: 'Quiz de Whitelist',
    category: 'Automation',

    async init(client: Client) {
        log.info('[WhitelistQuiz] Módulo inicializado no bot.');
    },

    async handleInteraction(interaction: Interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'whitelist_quiz_start') {
            await startQuiz(interaction as ButtonInteraction);
            return;
        }

        if (interaction.customId.startsWith('quiz_ans_')) {
            await handleAnswer(interaction as ButtonInteraction);
            return;
        }
    }
};

export default WhitelistQuizModule;
