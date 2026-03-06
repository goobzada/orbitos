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
// E embaralha as opções para não serem previsíveis
function prepareQuestions(raw: any[]): typeof DEFAULT_QUESTIONS {
    return raw.map(q => {
        const text = q.text || q.question || 'Pergunta';
        const rawOptions: string[] = [...(q.options || [])];

        // Determina qual é o texto da resposta correta ANTES de embaralhar
        let correctText = '';
        if (typeof q.correctAnswer === 'number' && rawOptions[q.correctAnswer]) {
            correctText = rawOptions[q.correctAnswer];
        } else if (typeof q.answer === 'string') {
            correctText = q.answer;
        } else {
            correctText = rawOptions[0] || '';
        }

        // Embaralha as opções (Fisher-Yates)
        for (let i = rawOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
        }

        // Encontra o novo índice da resposta correta
        const newCorrectIndex = rawOptions.indexOf(correctText);

        return {
            text,
            options: rawOptions,
            correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : 0
        };
    });
}

// Helper functions to avoid 'this' issues with the interface
async function startQuiz(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;

    const config = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');

    // Usa as perguntas do config OU o fallback padrão de 12 perguntas
    const rawQuestions = (config?.questions && config.questions.length > 0)
        ? config.questions
        : DEFAULT_QUESTIONS;

    // Prepara e embaralha
    const questions = prepareQuestions(rawQuestions);

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
                .setStyle(ButtonStyle.Secondary) // Mantém cor neutra para não dar a resposta!
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

    if (passed && session.roleId && session.roleId.trim() !== '' && session.autoApprove) {
        try {
            const guild = interaction.guild;
            if (guild) {
                const member = await guild.members.fetch(userId);
                const role = await guild.roles.fetch(session.roleId);

                if (member && role) {
                    // Verifica se o bot tem o cargo acima do cargo que vai dar
                    const botMember = guild.members.me;
                    if (botMember && botMember.roles.highest.position <= role.position) {
                        log.warn(`[WhitelistQuiz] Bot n\u00e3o pode dar o cargo ${role.name} pois ele est\u00e1 acima na hierarquia.`);
                        embed.setFooter({ text: '\u26a0\ufe0f O cargo configurado est\u00e1 acima da hierarquia do bot.' });
                    } else {
                        await member.roles.add(role);
                        embed.addFields({ name: 'Cargo Atribu\u00eddo', value: `<@&${session.roleId}>`, inline: true });
                        log.info(`[WhitelistQuiz] Cargo ${role.name} dado para ${member.user.tag}`);
                    }
                } else {
                    log.warn(`[WhitelistQuiz] Cargo (${session.roleId}) ou Membro (${userId}) n\u00e3o encontrado.`);
                }
            }
        } catch (err) {
            log.error(`[WhitelistQuiz] Erro crítico ao adicionar cargo: ${err}`);
            embed.setFooter({ text: '\u26a0\ufe0f Erro ao aplicar cargo. Verifique as permiss\u00f5es do bot.' });
        }
    }

    // DM result to the participant (approval or rejection).
    try {
        const dmResult = passed ? '✅ Aprovado' : '❌ Reprovado';
        const dmText =
            `**Resultado da Whitelist**\n` +
            `${dmResult}\n` +
            `Pontuação: **${percent}%** (${session.score}/${session.questions.length})\n` +
            `Mínimo exigido: **${session.passPercentage}%**`;

        await interaction.user.send({ content: dmText });
    } catch {
        // Ignore when participant has DMs disabled.
    }

    sessions.delete(userId);

    // Botão para fechar/limpar a mensagem efêmera
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('quiz_close_result')
            .setLabel('Fechar')
            .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
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

        if (interaction.customId === 'quiz_close_result') {
            await interaction.deferUpdate();
            await interaction.deleteReply();
            return;
        }
    }
};

export default WhitelistQuizModule;
