import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { moduleLoader } from '../index';

export default {
    data: new SlashCommandBuilder()
        .setName('wl')
        .setDescription('📝 Iniciar o teste de Whitelist (Quiz)')
        .addStringOption(option =>
            option.setName('modo')
                .setDescription('Modo da whitelist')
                .addChoices(
                    { name: 'Quiz', value: 'quiz' }
                )
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        // Buscamos a config do módulo whitelist_quiz
        const config = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist_quiz');

        if (!config || !config.questions || config.questions.length === 0) {
            return interaction.reply({
                content: '❌ O sistema de Whitelist ainda não foi configurado ou não possui perguntas.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🔒 Verificação de Whitelist (Quiz)')
            .setDescription('Para entrar em nosso servidor, você precisa passar em um breve teste de conhecimentos das regras.')
            .setColor(0x5865F2)
            .addFields({ name: 'Nota Mínima', value: `${config?.passPercentage || 80}%`, inline: true });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('whitelist_quiz_start')
                .setLabel('Iniciar Teste')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📝')
        );

        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};
