"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('wl')
        .setDescription('📝 Iniciar a Whitelist do servidor'),
    async execute(interaction) {
        if (!interaction.guildId) {
            return interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', ephemeral: true });
        }
        try {
            // Buscamos as chaves dos módulos para ver qual está configurado
            const simpleWlConfig = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');
            const quizWlConfig = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');
            // Determina qual usar baseado na configuração existente:
            let mode = null;
            let finalConfig = null;
            // Se tem perguntas configuradas no quiz e não tem no simples (ou o simples tá vazio) -> usa quiz
            if (quizWlConfig && quizWlConfig.questions && quizWlConfig.questions.length > 0) {
                mode = 'quiz';
                finalConfig = quizWlConfig;
            }
            // Mas se ele explicitamente ativou/configurou o "whitelist" simples, a gente dá prioridade a ele
            // Vamos assumir que se o dono configurou um roleId ou channelId no simples, ele quer usar o simples.
            // OU se o tipo de verificação for definido
            if (simpleWlConfig && (simpleWlConfig.roleId || simpleWlConfig.channelId || simpleWlConfig.verificationType)) {
                mode = 'simple';
                finalConfig = simpleWlConfig;
            }
            if (!mode) {
                return interaction.reply({
                    content: '❌ Nenhum sistema de Whitelist foi configurado ainda. Peça à administração para ativar o **Quiz de Whitelist** ou o **Sistema de Whitelist Manual** no painel!',
                    ephemeral: true
                });
            }
            if (mode === 'quiz') {
                // Monta o Embed do Quiz
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle('🔒 Verificação de Whitelist (Quiz)')
                    .setDescription('Para entrar em nosso servidor, você precisa passar em um breve teste de conhecimentos das regras.')
                    .setColor(0x5865F2)
                    .addFields({ name: 'Nota Mínima', value: `${finalConfig?.passPercentage || 80}%`, inline: true });
                const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId('whitelist_quiz_start')
                    .setLabel('Iniciar Teste')
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setEmoji('📝'));
                return interaction.reply({
                    embeds: [embed],
                    components: [row],
                    ephemeral: true
                });
            }
            else {
                // Handling Fallbacks and verificationType logic pra a Simple Whitelist
                const isId = finalConfig.verificationType === 'ID';
                const isCode = finalConfig.verificationType === 'CODE';
                if (isId) {
                    finalConfig.questions = ['Por favor, insira o seu Passaporte / ID do Jogo:'];
                }
                else if (isCode) {
                    finalConfig.questions = ['Por favor, insira o seu Código de Verificação:'];
                }
                else if (!finalConfig.questions || finalConfig.questions.length === 0) {
                    // Tratando fallback: Se quer manual mas não tem perguntas configuradas (ou mudou do quiz pro manual e não configurou)
                    if (quizWlConfig && quizWlConfig.questions && quizWlConfig.questions.length > 0) {
                        const simpleQuestions = quizWlConfig.questions.map((q) => q.text || q.question || q).filter(Boolean);
                        finalConfig.questions = simpleQuestions.slice(0, 5);
                    }
                    else {
                        finalConfig.questions = ["Por que você deseja entrar na cidade?", "Qual o seu Nick do Jogo?"];
                    }
                }
                let desc = 'Para entrar em nosso servidor, você precisa preencher o formulário de whitelist.\n\n';
                if (isId) {
                    desc = 'Para entrar em nosso servidor, você precisa informar o seu **ID do jogo**.\n\n';
                }
                else if (isCode) {
                    desc = 'Para entrar em nosso servidor, você precisa informar o seu **Código de Verificação**.\n\n';
                }
                if (finalConfig.autoApprove) {
                    desc += '• Você receberá o cargo **automaticamente** após enviar.\n';
                }
                else {
                    desc += '• Suas informações serão enviadas para a equipe de staff.\n';
                    desc += '• Se **aprovado**, você receberá o cargo automaticamente.\n';
                    desc += '• Se **reprovado**, você poderá tentar novamente usando `/wl`.\n';
                }
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(isId || isCode ? '🔒 Verificação Rápida' : '📝 Formulário de Whitelist')
                    .setDescription(desc)
                    .setColor(0x5865F2)
                    .addFields({ name: isId || isCode ? '📋 Dado Solicitado' : '📋 Perguntas', value: isId ? 'ID do Jogador' : isCode ? 'Código' : `${finalConfig.questions.length} pergunta(s)`, inline: true }, { name: '⏱️ Análise', value: finalConfig.autoApprove ? 'Automática' : 'Staff Manual', inline: true })
                    .setFooter({ text: 'OrbitOS Whitelist' });
                const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId('whitelist_start_simple')
                    .setLabel(isId || isCode ? 'Inserir Dados' : 'Iniciar Whitelist')
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setEmoji(isId ? '💳' : isCode ? '🔢' : '📝'));
                return interaction.reply({
                    embeds: [embed],
                    components: [row],
                    ephemeral: true
                });
            }
        }
        catch (error) {
            const err = error;
            console.error('[WLCommand] Error:', err.message);
            return interaction.reply({
                content: 'Houve um erro interno ao buscar a whitelist. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    }
};
