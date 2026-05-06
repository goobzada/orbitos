import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { DisTube, Song } from 'distube';
import { YouTubePlugin } from '@distube/youtube';
import { SpotifyPlugin } from '@distube/spotify';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';

export let distube: DisTube;

const music_module: BaseModule = {
    id: 'music_system',
    name: 'Sistema de Música',
    category: 'Entertainment',

    init: (client: Client) => {
        distube = new DisTube(client, {
            emitNewSongOnly: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
            plugins: [
                new YouTubePlugin(),
                new SpotifyPlugin(),
                new SoundCloudPlugin(),
            ],
        });

        // Evento: Quando uma música começa a tocar
        (distube as any).on('playSong', (queue: any, song: Song) => {
            const channel = queue.textChannel as TextChannel;
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor(0x1DB954) // Spotify Green
                .setTitle('🎶 Tocando Agora')
                .setDescription(`**[${song.name}](${song.url})**`)
                .addFields(
                    { name: '⏳ Duração', value: `\`${song.formattedDuration}\``, inline: true },
                    { name: '👤 Requisitado por', value: `${song.user}`, inline: true },
                    { name: '💿 Fonte', value: `\`${song.source.toUpperCase()}\``, inline: true }
                )
                .setThumbnail(song.thumbnail || null)
                .setFooter({ text: 'OrbitUp Music • Qualidade Ultra-Premium' });

            channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), (song.duration || 30) * 1000);
            });
        });

        // Evento: Quando uma música é adicionada à fila
        (distube as any).on('addSong', (queue: any, song: Song) => {
            const channel = queue.textChannel as TextChannel;
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor(0x00B0F4)
                .setDescription(`✅ **${song.name}** foi adicionada à fila!`)
                .setFooter({ text: `Posição: ${queue.songs.length}` });

            channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        });

        (distube as any).on('error', (channel: any, e: Error) => {
            if (channel && 'send' in channel) {
                (channel as TextChannel).send(`❌ Ocorreu um erro: ${e.message.slice(0, 200)}`);
            }
            log.error('[MUSIC] ❌ Erro no DisTube: ' + e);
        });

        log.info('[MUSIC] 🎵 Módulo de música inicializado com suporte a YT/Spotify/SC.');
    },

    handleAction: async (action: string, params: any): Promise<void> => {
        // Reservado para integração com Dashboard futuramente
        return;
    }
};

export default music_module;
