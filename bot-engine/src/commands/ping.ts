import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import coreApi from '../utils/api-client';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Mostra a latência do bot e o status da Core API'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const start = Date.now();
        let apiStatus = '✅ Online';
        let apiLatency = 0;
        let apiColor: number = 0x57F287; // verde

        try {
            const apiStart = Date.now();
            await coreApi.get('/');
            apiLatency = Date.now() - apiStart;
        } catch {
            apiStatus = '❌ Offline';
            apiColor = 0xED4245; // vermelho
        }

        const botLatency = Date.now() - start;
        const wsLatency = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(apiColor)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '🤖 Bot Latência', value: `\`${botLatency}ms\``, inline: true },
                { name: '📡 WebSocket', value: `\`${wsLatency}ms\``, inline: true },
                { name: '🧠 Core API', value: `${apiStatus} \`${apiLatency}ms\``, inline: true },
            )
            .setFooter({ text: 'SaaSBot • Status do Sistema' })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
