import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import coreApi from '../utils/api-client';
import { UI_STRINGS } from '../utils/translations';

export default {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Visualize seu nível atual, XP e posição no ranking do servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('Usuário para ver o nível (opcional)')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const guildId = interaction.guildId;
        const lang = 'pt-BR'; // Fallback para pt-BR

        try {
            // Buscar dados de nível na Core API
            const { data: levelData } = await coreApi.get(`/internal/levels/${guildId}/${targetUser.id}`);

            if (!levelData || levelData.level === undefined) {
                const noXpEmbed = new EmbedBuilder()
                    .setColor(0xFFB347) // Orange Warning
                    .setAuthor({ name: targetUser.username, iconURL: targetUser.displayAvatarURL() })
                    .setDescription(`⚠️ **Este usuário ainda não possui registro de atividade.**\nComece a interagir nos chats para ganhar XP e subir de nível!`);
                
                return interaction.editReply({ embeds: [noXpEmbed] });
            }

            // Calcular progresso para barra visual
            const currentXp = levelData.currentXp || 0;
            const xpToNext = levelData.xpToNext || 100;
            const totalXpRequired = currentXp + xpToNext;
            const progress = Math.min(Math.floor((currentXp / totalXpRequired) * 10), 10);
            
            // Barra de progresso visual premium
            const progressBar = '🟦'.repeat(progress) + '⬜'.repeat(10 - progress);

            const rankEmbed = new EmbedBuilder()
                .setColor(0x6366F1) // Indigo Premium
                .setAuthor({ 
                    name: `Perfil de Engajamento • OrbitUp`, 
                    iconURL: interaction.guild?.iconURL() || undefined 
                })
                .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
                .setTitle(`📊 Status de ${targetUser.username}`)
                .setDescription(
                    `O engajamento neste servidor é recompensado com níveis e prestígio.\n\n` +
                    `**ESTATÍSTICAS ATUAIS**\n` +
                    `╰── Nível: **\` ${levelData.level} \`**\n` +
                    `╰── Posição: **\` #${levelData.rank || '??'} \`**\n` +
                    `╰── XP Total: **\` ${levelData.totalXp.toLocaleString()} \`**\n\n` +
                    `**PROGRESSO DO NÍVEL**\n` +
                    `> ${progressBar} **${Math.floor((currentXp / totalXpRequired) * 100)}%**\n` +
                    `Faltam **${xpToNext.toLocaleString()} XP** para o nível **${levelData.level + 1}**.`
                )
                .setFooter({ 
                    text: `Requisitado por ${interaction.user.username}`, 
                    iconURL: interaction.user.displayAvatarURL({ size: 32 }) 
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [rankEmbed] });

        } catch (error: any) {
            console.error('[RankCmd] ❌ Erro ao buscar XP:', error?.message);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF5F5F)
                .setTitle('📡 Falha na Sincronização')
                .setDescription(UI_STRINGS[lang].apiOffline);

            return interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
