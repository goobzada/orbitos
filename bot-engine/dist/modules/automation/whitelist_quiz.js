"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../index");
const logger_1 = require("../../utils/logger");
const sessions = new Map();
// Helper functions to avoid 'this' issues with the interface
async function startQuiz(interaction) {
    if (!interaction.guildId)
        return;
    const config = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');
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
async function sendQuestion(interaction, userId) {
    const session = sessions.get(userId);
    if (!session)
        return;
    const question = session.questions[session.currentIndex];
    const progress = `Pergunta ${session.currentIndex + 1} de ${session.questions.length}`;
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('📝 Quiz de Whitelist')
        .setDescription(`**${question.text}**\n\n*${progress}*`)
        .setColor(0x5865F2)
        .setFooter({ text: 'OrbitOS Whitelist Engine' });
    const row = new discord_js_1.ActionRowBuilder();
    question.options.forEach((opt, idx) => {
        row.addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`quiz_ans_${idx}`)
            .setLabel(opt.substring(0, 80))
            .setStyle(discord_js_1.ButtonStyle.Secondary));
    });
    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed], components: [row] });
    }
    else {
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
}
async function handleAnswer(interaction) {
    const userId = interaction.user.id;
    const session = sessions.get(userId);
    if (!session)
        return;
    const answerIndex = parseInt(interaction.customId.replace('quiz_ans_', ''));
    const currentQuestion = session.questions[session.currentIndex];
    if (answerIndex === currentQuestion.correctAnswer) {
        session.score++;
    }
    session.currentIndex++;
    if (session.currentIndex >= session.questions.length) {
        await finishQuiz(interaction, userId);
    }
    else {
        await sendQuestion(interaction, userId);
    }
}
async function finishQuiz(interaction, userId) {
    const session = sessions.get(userId);
    if (!session)
        return;
    const percent = (session.score / session.questions.length) * 100;
    const passed = percent >= session.passPercentage;
    const embed = new discord_js_1.EmbedBuilder()
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
        }
        catch (err) {
            logger_1.log.error(`[WhitelistQuiz] Erro ao adicionar cargo: ${err}`);
            embed.setFooter({ text: '⚠️ Erro ao aplicar cargo. Contate um admin.' });
        }
    }
    sessions.delete(userId);
    await interaction.editReply({ embeds: [embed], components: [] });
}
const WhitelistQuizModule = {
    id: 'whitelist_quiz',
    name: 'Quiz de Whitelist',
    category: 'Automation',
    async init(client) {
        logger_1.log.info('[WhitelistQuiz] Módulo inicializado no bot.');
    },
    async handleInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (interaction.customId === 'whitelist_quiz_start') {
            await startQuiz(interaction);
            return;
        }
        if (interaction.customId.startsWith('quiz_ans_')) {
            await handleAnswer(interaction);
            return;
        }
    }
};
exports.default = WhitelistQuizModule;
