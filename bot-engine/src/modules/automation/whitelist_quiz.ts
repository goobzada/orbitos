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

// Helper functions to avoid 'this' issues with the interface
async function startQuiz(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;

    const config = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');

    if (!config || !config.questions || config.questions.length === 0) {
        return interaction.reply({
            content: '❌ Este quiz ainda não foi configurado corretamente no painel.',
            ephemeral: true
        });
    }

    sessions.set(interaction.user.id, {
        guildId: interaction.guildId,
        questions: config.questions,
        currentIndex: 0,
        score: 0,
        passPercentage: config.passPercentage || 80,
        roleId: config.roleId,
        autoApprove: config.autoApprove !== false
    });

    await sendQuestion(interaction, interaction.user.id);
}

async function sendQuestion(interaction: ButtonInteraction, userId: string) {
    const session = sessions.get(userId);
    if (!session) return;

    const question = session.questions[session.currentIndex];
    const progress = `Pergunta ${session.currentIndex + 1} de ${session.questions.length}`;

    const embed = new EmbedBuilder()
        .setTitle('📝 Quiz de Whitelist')
        .setDescription(`**${question.text}**\n\n*${progress}*`)
        .setColor(0x5865F2)
        .setFooter({ text: 'OrbitOS Whitelist Engine' });

    const row = new ActionRowBuilder<ButtonBuilder>();

    question.options.forEach((opt: string, idx: number) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`quiz_ans_${idx}`)
                .setLabel(opt.substring(0, 80))
                .setStyle(ButtonStyle.Secondary)
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
    if (!session) return;

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

    const percent = (session.score / session.questions.length) * 100;
    const passed = percent >= session.passPercentage;

    const embed = new EmbedBuilder()
        .setTitle(passed ? '✅ Resultado: Aprovado!' : '❌ Resultado: Reprovado')
        .setDescription(`Você acertou **${session.score}** de **${session.questions.length}** perguntas.\nSua pontuação final: **${percent.toFixed(0)}%**\nMínimo necessário: **${session.passPercentage}%**`)
        .setColor(passed ? 0x57F287 : 0xED4245);

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
