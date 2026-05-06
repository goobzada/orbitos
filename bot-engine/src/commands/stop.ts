import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { distube } from '../modules/entertainment/music';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('⏹️ Parar a música e limpar a fila'),

    async execute(interaction: ChatInputCommandInteraction) {
        const queue = distube.getQueue(interaction.guildId!);

        if (!queue) return interaction.reply({ content: '❌ Não há nada tocando no momento!', ephemeral: true });

        await distube.stop(interaction.guildId!);
        return interaction.reply({ content: '⏹️ Música parada e fila limpa. Até a próxima! 👋' });
    },
};
