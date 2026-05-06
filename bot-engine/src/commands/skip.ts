import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { distube } from '../modules/entertainment/music';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('⏭️ Pular a música atual'),

    async execute(interaction: ChatInputCommandInteraction) {
        const queue = distube.getQueue(interaction.guildId!);

        if (!queue) return interaction.reply({ content: '❌ Não há nada tocando no momento!', ephemeral: true });

        try {
            await distube.skip(interaction.guildId!);
            return interaction.reply({ content: '⏭️ Música pulada com sucesso!' });
        } catch (e) {
            return interaction.reply({ content: '❌ Não há mais músicas na fila para pular!', ephemeral: true });
        }
    },
};
