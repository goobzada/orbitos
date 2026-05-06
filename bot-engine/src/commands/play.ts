import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { distube } from '../modules/entertainment/music';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎶 Tocar música ou playlist (YT/Spotify/SoundCloud)')
        .addStringOption(o => o.setName('busca').setDescription('Nome da música ou link').setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const query = interaction.options.getString('busca', true);
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Você precisa estar em um canal de voz para tocar música!', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            await distube.play(voiceChannel, query, {
                textChannel: interaction.channel as any,
                member: member,
            });

            const embed = new EmbedBuilder()
                .setColor(0x1DB954)
                .setDescription(`🔍 Buscando por: **${query}**...`);

            await interaction.editReply({ embeds: [embed] });
            
            // Auto-delete a mensagem de busca após 5 segundos
            setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);

        } catch (error: any) {
            console.error('[PLAY] ❌ Erro:', error);
            await interaction.editReply({ content: `❌ Falha ao processar a música: ${error.message}` });
        }
    },
};
